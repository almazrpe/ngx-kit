import { webSocket, WebSocketSubject } from "rxjs/webSocket";
import { log } from "./log";
import { Queue } from "queue-typescript";
import
{
  catchError,
  map,
  Observable,
  ReplaySubject,
  Subscription
} from "rxjs";
import { AlertLevel } from "./alert/models";
import { AlertService } from "./alert/alert.service";
import { takeOrSkip } from "./rxjs-utils";
import { ConService } from "./connection/connection.service";
import { assert, Err, ErrCls, Ok, panic, Res, resultifyPipe } from "./copper";
import {uuid4} from "./uuid";

export type Msg = any;

export class Bmsg {
  public sid: string;
  public msg: Msg;
  public codeid: number;
  public lsid: string | undefined;
  public is_err: boolean | undefined;

  public constructor(
    sid: string,
    codeid: number,
    msg: any,
    lsid?: string,
    is_err?: boolean,
  ) {
    this.sid = sid;
    this.msg = msg;
    this.lsid = lsid;
    this.is_err = is_err;
  }
}

export enum mcode {
  Welcome = "yon::server::welcome",
  Ok = "yon::ok"
}

export interface Welcome {
  codes: string[];
}

export interface OkMsg {
}

export enum StaticCodeids {
  Welcome = 0,
  Ok = 1
}

export interface PubOpts {
  skipNet: boolean;
  skipInner: boolean;
  /// Publications that are supplied with lsid will be sent as responses.
  _lsid?: string;
}
const DEFAULT_PUB_OPTS: PubOpts = {
  skipNet: false,
  skipInner: false,
  _lsid: undefined
}

function ser(msg: Msg, codeid: number): Bmsg {
  let is_err: boolean | undefined = msg instanceof Err;
  if (!is_err) {
    is_err = undefined;
  }

  assert(codeid > 1, "must not include static codeids");
  return new Bmsg(
    uuid4(),
    codeid,
    msg,
    // client cannot send msg with lsid, for now
    undefined,
    is_err
  );
}

function de(raw: any): Res<Bmsg> {
  let sid = raw.sid;
  let codeid = raw.codeid;
  let msg = raw.msg;
  let lsid = raw.lsid;
  let is_err = raw.is_err;
  if (
    sid === undefined
    || codeid === undefined
    || msg === undefined
  ) {
    return Err("incorrect msg " + raw + " composition");
  }

  let bmsg = new Bmsg(sid, codeid, msg, lsid, is_err);
  return Ok(bmsg);
}

// Client sub fn doesn't return anything to publish back, instead they can
// call `Bus.pub` undependently, but not so many subs actually need to.
export type SubFn<T = Msg> = (msg: T) => void;

export interface CodeData<T = any> {
  lastMsg: Msg | undefined;
  subs: Map<string, SubFn<T>>;
}

export class Bus {
  private static _ie: Bus;
  public static get ie(): Bus {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    return this._ie || (this._ie = new this());
  }

  private conWrapper$: Observable<WebSocketSubject<Bmsg>>;
  private con: WebSocketSubject<Bmsg> | null = null;
  private conWrapperSub: Subscription | null = null;

  private codesData: Map<string, CodeData<any>> = new Map();

  private codes: string[] = [];
  private isInitd: boolean = false;
  private isWelcomeRecvd: boolean = false;

  private alertSv: AlertService;
  private conSv: ConService;

  private awaitingResponse: Map<string, SubFn> = new Map();

  public init(
    alertSv: AlertService,
    conSv: ConService,
  ): void {
    if (this.isInitd) {
      return;
    }

    this.alertSv = alertSv;
    this.conSv = conSv;

    this.conWrapper$ = this.conSv.serverWsUrl$.pipe(
      map(url => {
        log.info(`connect websocket at ${url + "/rx"}`);
        return webSocket<Bmsg>(
          url + "/rx"
        );
      }),
    );

    this.conWrapper$.subscribe({
      next: con => {
        this.con = con;
        if (this.conWrapperSub !== null) {
          this.conWrapperSub.unsubscribe();
          this.conWrapperSub = null;
        }
        this.conWrapperSub = con.subscribe({
          next: (rawmsg: Bmsg) => this.recv.call(this, rawmsg),
          error: (err: any) => this.recvErr.call(this, err),
          complete: () => this.recvComplete.call(this)
        });
      }
    });

    this.isInitd = true;
  }

  public sub<T>(
    code: string,
    fn: SubFn<T>
  ): Res<() => void> {
    let codeData = this.codesData.get(code);
    if (codeData === undefined) {
      return Err(`unrecognized code ${code}`);
    }
    let subid = uuid4();
    codeData.subs.set(subid, fn);
    // call with last msg
    if (codeData.lastMsg !== undefined) {
      this.callSubFn(fn, codeData.lastMsg as T);
    }

    return Ok(() => {
      if (codeData !== undefined) {
        // we don't care about unsub result
        codeData.subs.delete(subid);
      }
    });
  }

  private callSubFn<T>(fn: SubFn<T>, msg: T) {
    try {
      fn(msg);
    } catch (err) {
      log.track(err);
    }
  }

  /// Publishes msg and awaits for the response.
  public pub$(
    code: string, msg: Msg, opts: PubOpts = DEFAULT_PUB_OPTS
  ): Observable<Res<Msg>> {
    const subject$ = new ReplaySubject<Msg>();
    const subfn = (msg: Msg): void => subject$.next(msg);
    this.pub(code, msg, subfn, opts);
    return subject$.asObservable().pipe(
      resultifyPipe<Msg>(),
      map(msg => {
        if (msg instanceof ErrCls) {
          // additionally spawn alerts for errors happened as responses
          // this maybe changed in a future, but for now we found it
          // convenient to notify user about all errors happened
          this.alertSv.spawn({
            level: AlertLevel.Error,
            msg: msg.display()
          });
        }

        return msg;
      })
    );
  }

  /// Publish msg and calls the provided function when the response arrives.
  public pub(
    code: string,
    msg: Msg,
    fn: SubFn,
    opts: PubOpts = DEFAULT_PUB_OPTS
  ): Res<undefined> {
    // SEND ORDER
    //    1. Net
    //    2. Inner
    //    3. As response

    // send to net
    if (!opts.skipNet) {
      let codeid = this.getCodeidByCode(msg.code());
      if (codeid.is_err()) {
        return codeid;
      }
      let serMsg = ser(msg, codeid.ok);
      log.info("NET::SEND | " + JSON.stringify(serMsg));

      if (this.con !== null) {
        this.con.next(serMsg);
      } else {
        log.err("tried to emit msg, but con is null");
      }
    }

    // send to inner
    if (!opts.skipInner) {
      for (const [code_, codeData] of Object.entries(this.codesData)) {
        if (code_ == code) {
          this.callSubFn(codeData.fn, msg);
        }
      }
    }

    // send as response
    if (opts._lsid !== undefined) {
      let awaitingFn = this.awaitingResponse.get(opts._lsid);
      if (awaitingFn !== undefined) {
        this.callSubFn(awaitingFn, msg);
        // clear after satisfying with the response
        this.awaitingResponse.delete(opts._lsid);
      }
    }

    return Ok(undefined);
  }

  public getCodeidByCode(code: string): Res<number> {
    let index = this.codes.findIndex((c, _i, _o) => c == code);
    if (index < 0) {
      return Err(`unrecognized code ${code}`);
    }
    return Ok(index);
  }

  private recv(raw: any): void {
    log.info("NET::RECV | " + raw);
    let bmsg_r = de(raw);
    if (bmsg_r.is_err()) {
      log.track(bmsg_r);
    }

    if (!this.isWelcomeRecvd) {
      const initdMsg = bmsg as any;
      const indexedMcodes = initdMsg["indexedMcodes"];
      const indexedErrcodes = initdMsg["indexedErrcodes"];

      if (indexedMcodes === undefined || indexedErrcodes === undefined) {
        log.catch(new Error(
          "expected initd msg, got " + JSON.stringify(initdMsg)
        ));
        return;
      }

      this.indexedMcodes = indexedMcodes;
      this.indexedErrcodes = indexedErrcodes;
      this.isWelcomeRecvd = true;
      while (this.execWhenInitdEvtReceived.length > 0) {
        this.execWhenInitdEvtReceived.dequeue()();
      }
      return;
    }

    const msg = MsgUtils.tryDeserializeJson(
      bmsg, this.indexedMcodes, this.indexedErrcodes
    );
    if (msg === null) {
      return;
    }
    if (msg instanceof ErrEvt && msg.err === undefined) {
      // create generic err for unhandled err codes
      msg.err = Error(msg.errmsg);
    }
    this.pub(msg, undefined, { isNetSendSkipped: true });
  }

  private recvErr(err: any): void {
    log.err("con err: " + err);
  }

  private recvComplete(): void {
    log.info("client bus con completed");
  }
}

