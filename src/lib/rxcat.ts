import { webSocket, WebSocketSubject } from "rxjs/webSocket";
import { v4 as uuid } from "uuid";
import { asrt } from "./asrt";
import { log } from "./log";
import { Queue } from "queue-typescript";
import {
  catchError,
  map,
  Observable,
  ReplaySubject,
  Subscription
} from "rxjs";
import {
  AnyConstructor,
  code,
  FcodeCore
} from "./fcode";
import {
  NotFoundErr,
  AlreadyProcessedErr,
  InpErr
} from "./err";
import { AlertLevel } from "./alert/models";
import { AlertService } from "./alert/alert.service";
import { takeOrSkip } from "./rxjs-utils";
import { ConnService } from "./conn/conn.service";
import { ArrUtils } from "./arr";
import {
  CreateDocReq, DelDocReq, GetDocsReq, RegisterReq, UpdDocReq
} from "./msg";

export abstract class BusUtils
{
  public static pubGetDocsReq$<TRetUdto>(
    req: GetDocsReq,
    opts: PubOpts = {}
  ): Observable<TRetUdto[]>
  {
    return ClientBus.ie.pub$(req, opts).pipe(
      map(rae => (rae.evt as any).udtos)
    );
  }

  public static pubGetDocReq$<TRetUdto>(
    req: GetDocsReq,
    opts: PubOpts = {}
  ): Observable<TRetUdto>
  {
    return ClientBus.ie.pub$(req, opts).pipe(
      // warning is no more for arr.length > 1
      map(rae => ArrUtils.getFirst((rae.evt as any).udtos, false))
    );
  }

  public static pubCreateDocReq$<TRetUdto>(
    req: CreateDocReq,
    opts: PubOpts = {}
  ): Observable<TRetUdto>
  {
    return ClientBus.ie.pub$(req, opts).pipe(
      map(rae => (rae.evt as any).udto)
    );
  }

  public static pubUpdDocReq$<TRetUdto>(
    req: UpdDocReq,
    opts: PubOpts = {}
  ): Observable<TRetUdto>
  {
    return ClientBus.ie.pub$(
      req, opts
    ).pipe(map(rae => (rae.evt as any).udto));
  }

  public static pubDelDocReq$(
    req: DelDocReq,
    opts: PubOpts = {}
  ): Observable<void>
  {
    return ClientBus.ie.pub$(req, opts)
      .pipe(
        map(_ => { return; })
      );
  }
}


interface ReqAndRaction
{
  req: Req;
  raction: PubAction;
}

export class Msg
{
  public msid: string;

  public constructor(
    args?: any
  )
  {
    if (args?.msid === undefined)
    {
      this.msid = MsgUtils.genUuid();
      return;
    }
    this.msid = args.msid;
  }
}

export interface Rawmsg
{
  msid: string;
  mcodeid: number;
  rsid?: string;
}

export class Evt extends Msg
{
  public rsid: string | undefined;

  public constructor(
    args?: any
  )
  {
    super(args);
    this.rsid = args?.rsid;
  }
}

export class Req extends Msg
{
}

export interface ErrEvtArgs
{
  errmsg: string;
  isThrownByPubAction: boolean | undefined;
  err: Error;
}

@code("err-evt")
export class ErrEvt extends Evt
{
  public errcodeid: number | undefined;
  public errmsg: string;
  public isThrownByPubAction: boolean | undefined;

  /**
    * Since only server can throw err evts, client need to deserialize them
    * to an aux field, if they have an according err class registered for
    * this errcodeid.
    *
    * If client cannot find an according err, the base class is initialized
    * with errmsg.
    */
  public err: Error;

  public constructor(
    args: ErrEvtArgs
  )
  {
    super(args);
    this.errmsg = args.errmsg;
    this.isThrownByPubAction = args.isThrownByPubAction;
    this.err = args.err;
  }
}

export abstract class MsgUtils
{
  public static genUuid(): string
  {
    return uuid().replaceAll("-", "");
  }

  public static isMsg(obj: any): obj is Msg
  {
    return (
      "msid" in obj
      && "mcode" in obj
    );
  }

  public static isEvt(obj: any): obj is Evt
  {
    return this.isMsg(obj);
  }

  public static isReq(obj: any): obj is Req
  {
    return this.isMsg(obj);
  }

  public static serializeJson(msg: Msg, mcodeid: number): Rawmsg
  {
    const data: any = Object.assign({}, msg);

    // remove unecessary fields
    const keysToDel: string[] = [];
    Object.keys(data).forEach((k) =>
    {
      if (data[k] === undefined || data[k] === null)
      {
        keysToDel.push(k);
      }
    });

    for (const k in keysToDel)
    {
      delete data[k];
    }

    asrt.run("msid" in data);
    asrt.run(mcodeid >= 0);
    data["mcodeid"] = mcodeid;
    return data as Rawmsg;
  }

  public static tryDeserializeJson(
    rawmsg: Rawmsg,
    indexedMcodes: string[][],
    indexedErrcodes: string[][]
  ): Msg | null
  {
    const allMcodes = indexedMcodes[rawmsg.mcodeid];
    const constructor = FcodeCore.ie.tryGetConstructorForAnyCodes(allMcodes);
    if (allMcodes.includes("initd-client-evt"))
    {
      log.warn("duplicate initd-client-evt msg => discard");
      return null;
    }
    if (constructor === undefined)
    {
      log.err("no constructor for any of mcodes " + allMcodes);
      return null;
    }

    const fdata: any = { ...rawmsg };
    if ("errcodeid" in fdata)
    {
      const allErrcodes = indexedErrcodes[fdata["errcodeid"]];
      const errConstructor = FcodeCore.ie.tryGetConstructorForAnyCodes(
        allErrcodes
      );

      const errmsg = fdata["errmsg"];
      let errf: Error = new Error(errmsg);
      if (errConstructor !== undefined)
      {
        errf = new errConstructor(errmsg);
      }
      fdata["err"] = errf;
    }

    if ("mcodeid" in fdata)
    {
      delete fdata["mcodeid"];
    }

    return new constructor(fdata);
  }
}

export interface ReqAndEvt<TReq = Req, TEvt = Evt>
{
  req: TReq;
  evt: TEvt;
}

export interface SubActionAndOpts
{
  action: SubAction;
  opts: SubOpts;
}
export type SubAction = (msg: Msg) => void;
export type PubAction = (req: Req, evt: Evt) => void;

export interface SubOpts
{
  isLastMsgSkipped?: boolean;
}

export interface PubOpts
{
  isNetSendSkipped?: boolean;
  isInnerSendSkipped?: boolean;
}

export type MsgType = any;

// todo: for now we simplify, and consider this bus only as a client one.
//       In future this should conform to uniform bus, but configured as client
//       one.
export class ClientBus
{
  private static _ie: ClientBus;

  public static get ie(): ClientBus
  {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    return this._ie || (this._ie = new this());
  }

  private connWrapper$: Observable<WebSocketSubject<Rawmsg>>;
  private conn: WebSocketSubject<Rawmsg> | null = null;
  private connWrapperSub: Subscription | null = null;

  private nextSubId: number = 0;
  private subidToMcode: { [key: number]: string } = {};
  private subidToSubActionAndOpts: { [key: number]: SubActionAndOpts } = {};
  private mcodeToLastMsg: { [key: string]: Msg } = {};

  private indexedMcodes: string[][] = [];
  private indexedErrcodes: string[][] = [];
  private isInitdEvtReceived: boolean = false;
  private isInitd: boolean = false;
  private execWhenInitdEvtReceived: Queue<() => void> =
    new Queue<() => void>();

  private alertSv: AlertService;
  private connSv: ConnService;

  private rsidToReqAndAction: { [rsid: string]: ReqAndRaction } = {};

  private constructor()
  {
  }

  public init(
    alertSv: AlertService,
    connSv: ConnService,
    tokens: string[] = [],
    registerData: {[key: string]: any} = {}
  ): void
  {
    if (this.isInitd)
    {
      return;
    }

    this.alertSv = alertSv;
    this.connSv = connSv;

    this.connWrapper$ = this.connSv.serverWsUrl$.pipe(
      map(url =>
      {
        log.info(`conn ws at ${url + "/rx"}`);
        return webSocket<Rawmsg>(
          url + "/rx"
        );
      }),
    );

    this.connWrapper$.subscribe({
      next: conn =>
      {
        this.conn = conn;
        this.registerClient(tokens, registerData);
        if (this.connWrapperSub !== null)
        {
          this.connWrapperSub.unsubscribe();
          this.connWrapperSub = null;
        }
        this.connWrapperSub = conn.subscribe({
          next: (rawmsg: Rawmsg) => this.receiveConnRawmsg.call(this, rawmsg),
          error: (err: any) => this.receiveConnErr.call(this, err),
          complete: () => this.receiveConnComplete.call(this)
        });
      }
    });

    this.isInitd = true;
  }

  private registerClient(
    tokens: string[],
    data: {[key: string]: any})
  {
    // todo:
    //    sent corrected register reqs once server bus implements it, for now
    //    just hope for the good
    let msg = new RegisterReq({tokens: tokens, data: data});
    let serializedMsg = MsgUtils.serializeJson(
      msg,
      0
    );
    asrt.run(this.conn !== null);
    this.conn?.next(serializedMsg);
  }

  public sub(
    constructor: AnyConstructor,
    action: SubAction,
    opts: SubOpts = {} as SubOpts
  ): () => void
  {
    const mcode = FcodeCore.ie.tryGetActiveCodeForConstructor(constructor);
    if (mcode === undefined)
    {
      throw new NotFoundErr(constructor);
    }

    const subid = this.nextSubId;
    this.nextSubId++;

    asrt.run(!(subid in this.subidToMcode));
    asrt.run(!(subid in this.subidToSubActionAndOpts));
    this.subidToMcode[subid] = mcode;
    this.subidToSubActionAndOpts[subid] = { action: action, opts: opts };

    if (opts.isLastMsgSkipped === true)
    {
      const lastMsg = this.mcodeToLastMsg[mcode];
      if (lastMsg !== undefined)
      {
        this.tryInvokeAction(action, lastMsg);
      }
    }

    return (() => {this.unsub(subid);});
  }

  public unsub(subid: number): boolean
  {
    if (!(subid in this.subidToMcode))
    {
      throw new NotFoundErr(subid);
    }

    asrt.run(subid in this.subidToSubActionAndOpts);

    delete this.subidToMcode[subid];
    delete this.subidToSubActionAndOpts[subid];
    return true;
  }

  public pub$<TReq = Req, TEvt = Evt>(
    req: TReq,
    opts: PubOpts = {} as PubOpts,
    howManyToTake: number = 1
  ): Observable<ReqAndEvt<TReq, TEvt>>
  {
    const subject$ = new ReplaySubject<ReqAndEvt<TReq, TEvt>>();

    const pubaction = (req: TReq, evt: TEvt): void =>
    {
      subject$.next({ req: req, evt: evt });
    };

    this.pub(req as Msg, pubaction as PubAction, opts);
    return subject$.asObservable().pipe(
      // todo: tmp catch until ngx-kit implements normal err handler
      catchError(e =>
      {
        log.catch(e);
        throw e;
      }),
      map((rae) =>
      {
        const evt = rae.evt;

        if (evt instanceof ErrEvt)
        {
          this.alertSv.spawn({
            level: AlertLevel.Error,
            message: evt.errmsg
          });
          throw evt.err;
        }

        return rae;
      }),
      takeOrSkip(howManyToTake)
    );
  }

  public pub(
    msg: Msg,
    pubaction: PubAction | undefined = undefined,
    opts: PubOpts = {} as PubOpts
  ): void
  {
    if (!this.isInitdEvtReceived)
    {
      this.execWhenInitdEvtReceived.enqueue(
        () => this.pub(msg, pubaction, opts)
      );
      return;
    }
    if (!(msg instanceof Req) && pubaction !== undefined)
    {
      throw new InpErr("non-req msg and defined raction");
    }

    // RESOLVE MCODE
    const currentMcode = FcodeCore.ie.tryGetActiveCodeForConstructor(
      Object.getPrototypeOf(msg).constructor
    );
    if (currentMcode === undefined)
    {
      throw new NotFoundErr("mcode for constructor");
    }
    const mcodeid = this.indexedMcodes.findIndex(
      (codes: string[]) => codes.includes(currentMcode)
    );
    if (mcodeid < 0)
    {
      const err = Error(
        `mcode ${currentMcode} is found locally,`
        + " but does not exist in remote"
      );
      log.catch(err);
      return;
    }

    // RESOLVE PUBACTION
    if (msg instanceof Req && pubaction !== undefined)
    {
      if (msg.msid in this.rsidToReqAndAction)
      {
        throw new AlreadyProcessedErr(msg.msid);
      }
      this.rsidToReqAndAction[msg.msid] = { req: msg, raction: pubaction };
    }

    // SEND ORDER
    //    1. Net
    //    2. Inner
    //    3. As response

    // send to net
    if (opts.isNetSendSkipped !== true)
    {
      const serializedMsg = MsgUtils.serializeJson(
        msg,
        mcodeid
      );
      log.info("send: " +  JSON.stringify(serializedMsg));

      if (this.conn !== null)
      {
        this.conn.next(serializedMsg);
      }
      else
      {
        log.err("tried to emit msg, but conn is null");
      }
    }

    // send to inner
    if (opts.isInnerSendSkipped !== true)
    {
      for (const [subid, existingMcode] of Object.entries(this.subidToMcode))
      {
        if (currentMcode == existingMcode)
        {
          // if any action fails this is out of responsibility of this pub
          // method - so just continue
          this.tryInvokeAction(
            this.subidToSubActionAndOpts[Number.parseInt(subid)].action,
            msg
          );
        }
      }
    }

    // send as response
    if (msg instanceof Evt && msg.rsid !== undefined)
    {
      this.sendAsResponse(msg);
    }
  }

  private sendAsResponse(evt: Evt): void
  {
    if (evt.rsid === undefined)
    {
      return;
    }

    const reqAndRaction = this.rsidToReqAndAction[evt.rsid];
    if (reqAndRaction === undefined)
    {
      return;
    }
    delete this.rsidToReqAndAction[evt.rsid];

    this.tryInvokeRaction(reqAndRaction.raction, reqAndRaction.req, evt);
  }

  private tryInvokeAction(action: SubAction, msg: Msg): boolean
  {
    try
    {
      action(msg);
    }
    catch (err)
    {
      log.catch(err as Error);
      return false;
    }

    return true;
  }

  private tryInvokeRaction(action: PubAction, req: Req, evt: Evt): boolean
  {
    try
    {
      action(req, evt);
    }
    catch (err)
    {
      log.catch(err as Error);
      return false;
    }

    return true;
  }

  private receiveConnRawmsg(rawmsg: Rawmsg): void
  {
    log.info("receive: " +  JSON.stringify(rawmsg));

    if (!("msid" in rawmsg))
    {
      return;
    }

    if (!this.isInitdEvtReceived)
    {
      const initdMsg = rawmsg as any;
      const indexedMcodes = initdMsg["indexedMcodes"];
      const indexedErrcodes = initdMsg["indexedErrcodes"];

      if (indexedMcodes === undefined || indexedErrcodes === undefined)
      {
        log.catch(new Error(
          "expected initd msg, got " + JSON.stringify(initdMsg)
        ));
        return;
      }

      this.indexedMcodes = indexedMcodes;
      this.indexedErrcodes = indexedErrcodes;
      this.isInitdEvtReceived = true;
      while (this.execWhenInitdEvtReceived.length > 0)
      {
        this.execWhenInitdEvtReceived.dequeue()();
      }
      return;
    }

    const msg = MsgUtils.tryDeserializeJson(
      rawmsg, this.indexedMcodes, this.indexedErrcodes
    );
    if (msg === null)
    {
      return;
    }
    if (msg instanceof ErrEvt && msg.err === undefined)
    {
      // create generic err for unhandled err codes
      msg.err = Error(msg.errmsg);
    }
    this.pub(msg, undefined, { isNetSendSkipped: true });
  }

  private receiveConnErr(err: any): void
  {
    log.err("conn err: " + err);
  }

  private receiveConnComplete(): void
  {
    log.info("client bus conn completed");
  }
}

