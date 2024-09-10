import { webSocket, WebSocketSubject } from "rxjs/webSocket";
import { log } from "./log";
import
{
  map,
  Observable,
  pipe,
  ReplaySubject,
  Subscription,
  take
} from "rxjs";
import { AlertLevel } from "./alert/models";
import { AlertService } from "./alert/alert.service";
import { ConService } from "./connection/connection.service";
import { assert, Err, ErrCls, Ok, panic, Res, pipeResultify, RxPipe } from "./copper";
import {uuid4} from "./uuid";

export type Msg = any;

export class Bmsg {
  public sid: string;
  public codeid: number;
  public msg: Msg;
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
    this.codeid = codeid;
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
export const DEFAULT_PUB_OPTS: PubOpts = {
  skipNet: false,
  skipInner: false,
  _lsid: undefined
};

function ser(sid: string, msg: Msg, codeid: number): Bmsg {
  let is_err: boolean | undefined = msg instanceof Err;
  if (!is_err) {
    is_err = undefined;
  }

  assert(codeid > 1, "must not include static codeids");
  return new Bmsg(
    sid,
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
    return Err("incorrect msg composition");
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
  public pub$<T = OkMsg>(
    code: string, msg: Msg, opts: PubOpts = DEFAULT_PUB_OPTS
  ): Observable<Res<T>> {
    const subject$ = new ReplaySubject<Msg>();
    const subfn = (msg: Msg): void => subject$.next(msg);
    this.pub(code, msg, subfn, opts);
    return subject$.asObservable().pipe(
      pipeResultify<Msg>(),
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
      }),
      take(1)
    );
  }

  /// Publish msg and calls the provided function when the response arrives.
  public pub<T = any>(
    code: string,
    msg: Msg,
    fn?: SubFn<T>,
    opts: PubOpts = DEFAULT_PUB_OPTS
  ): Res<undefined> {
    if (opts._lsid !== undefined && fn !== undefined) {
      return Err("cannot provide both lsid and sub function");
    }

    // SEND ORDER
    //    1. Net
    //    2. Inner
    //    3. As response

    let codeData = this.codesData.get(code);
    if (codeData === undefined) {
      return Err("cannot find code " + code);
    }
    codeData.lastMsg = msg;

    let sid = uuid4();
    if (fn !== undefined) {
      this.awaitingResponse.set(sid, fn);
    }

    // send to net
    if (!opts.skipNet) {
      let codeid = this.getCodeidByCode(code);
      if (codeid.is_err()) {
        return codeid;
      }
      let bmsg = ser(sid, msg, codeid.ok);

      log.info(`NET::SEND | ${code} | ${JSON.stringify(bmsg)}`);

      if (this.con !== null) {
        this.con.next(bmsg);
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

  public getCodeByCodeid(codeid: number): Res<string> {
    if (codeid > this.codes.length - 1) {
      return Err(`no codeid ${codeid}`);
    }
    return Ok(this.codes[codeid]);
  }

  private welcome(raw: any): void {
      let codes = raw.msg.codes;
      if (codes === undefined) {
        panic("incorrect welcome message composition");
      }
      this.codes = codes;
      this.codesData.clear();
      for (let code of this.codes) {
        this.codesData.set(code, {lastMsg: undefined, subs: new Map()});
      }
      this.isWelcomeRecvd = true;
  }

  private recv(raw: any): void {
    let bmsg_r = de(raw);
    if (bmsg_r.is_err()) {
      log.track(bmsg_r);
      return;
    }

    if (!this.isWelcomeRecvd) {
      // welcome msg is not logged as NET::RECV
      this.welcome(raw);
      return;
    }

    let msg_r = de(raw);
    if (msg_r.is_err()) {
      log.track(msg_r, "bus receive");
      return;
    }
    let msg = msg_r.ok;
    let codeid = msg.codeid;
    let code_r = this.getCodeByCodeid(codeid);
    if (msg_r.is_err()) {
      log.track(msg_r, `codeid ${codeid} unpack`);
      return;
    }
    let log_msg = `NET::RECV | ${code_r.ok} | ${JSON.stringify(raw)}`
    if (code_r.ok?.endsWith("err")) {
      log.err(log_msg)
    } else {
      log.info(log_msg)
    }
    this.pub(
      code_r.ok as string,
      msg,
      undefined,
      // disallow duplicate net resending
      { ...DEFAULT_PUB_OPTS, skipNet: true }
    );
  }

  private recvErr(err: any): void {
    let msg =
      "client bus connection is closed with error: " + err
    this.alertSv.spawn({
      level: AlertLevel.Error,
      msg: msg
    });
    log.err(msg)
  }

  private recvComplete(): void {
    this.alertSv.spawn({
      level: AlertLevel.Warning,
      msg: "client bus connection is closed"
    });
  }
}

export function pipeToVoidFromOkMsg(): RxPipe<OkMsg, void> {
  return pipe(
    map(_ => {
      return;
    })
  )
}

