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
import { 
    assert, 
    Err, 
    ErrCls, 
    Ok, 
    panic, 
    Res, 
    RxPipe 
} from "./copper";
import { uuid4 } from "./uuid";
import { Queue } from "queue-typescript";

export type Msg = any;

export class Bmsg {
    public sid: string;
    public codeid: number;
    public msg: Msg | undefined;
    public lsid: string | undefined;
    public is_err: boolean | undefined;

    public constructor(
        sid: string,
        codeid: number,
        msg?: any,
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
    _isErr?: boolean;
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
        // client cannot send errors
        undefined
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
    ) {
        return Err("incorrect msg composition");
    }

    let bmsg = new Bmsg(sid, codeid, msg, lsid, is_err);
    return Ok(bmsg);
}

// Client sub fn doesn't return anything to publish back, instead they can
// call `Bus.pub` undependently, but not so many subs actually need to.
export type SmallSubFn<T = Msg> = (msg: T) => void
export type SubFn<T = Msg> = (code: string, msg: T, isErr: boolean) => void

export interface CodeData<T = any> {
    isErr: boolean;
    lastMsg: Msg | undefined;
    subs: Map<string, SubFn<T>>;
}

export interface AwaitingForResponse {
    initialCode: string;
    initialCodeSuffix?: string;
    fn: SubFn;
}

export class Bus {
    private static _ie: Bus;
    public static get ie(): Bus {
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        return this._ie || (this._ie = new this());
    }

    /// Does some action, but doesn't change how error flows further.
    public onErrPassedToSubFn: (err: ErrCls) => void = _ => {};

    private conWrapper$: Observable<WebSocketSubject<Bmsg>>;
    private con: WebSocketSubject<Bmsg> | null = null;
    private conWrapperSub: Subscription | null = null;

    private codesData: Map<string, CodeData<any>> = new Map();

    private codes: string[] = [];
    private isInitd: boolean = false;

    private alertSv: AlertService;
    private conSv: ConService;
    public onWelcome: Queue<() => void> = new Queue();

    /// Map of initial message sid to awaiting function data.
    private awaitingForResponse: Map<string, AwaitingForResponse> = new Map();

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
                log.info(`connecting websocket at ${url + "/rx"}`);
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

    private isWelcomeArrived(): boolean {
        return this.codes.length > 0;
    }

    public sub<T>(
        code: string,
        fn: SmallSubFn<T>,
        retUnsub: (unsub: () => void) => void = _ => {}
    ): Res<undefined> {
        return this.subFull(
            code,
            (_code, msg: T, _isErr) => {
fn(msg);
},
            retUnsub
        );
    }

    public subFull<T>(
        code: string,
        fn: SubFn<T>,
        retUnsub: (unsub: () => void) => void = _ => {}
    ): Res<undefined> {
        if (!this.isWelcomeArrived()) {
            this.onWelcome.enqueue(() => {
this.subFull(code, fn, retUnsub);
});
            return Ok(undefined);
        }

        let codeData = this.codesData.get(code);
        if (codeData === undefined) {
            return Err(`unrecognized code ${code}`);
        }
        let subid = uuid4();
        codeData.subs.set(subid, fn);
        // call with last msg
        if (codeData.lastMsg !== undefined) {
            this.callSubFn(fn, code, codeData.lastMsg as T, codeData.isErr);
        }

        retUnsub(() => {
            if (codeData !== undefined) {
                // we don't care about unsub result
                codeData.subs.delete(subid);
            }
        });
        return Ok(undefined);
    }

    private callSubFn<T>(fn: SubFn<T>, code: string, msg: T, isErr: boolean) {
        if (isErr && msg instanceof ErrCls) {
            this.onErrPassedToSubFn(msg);
        }
        try {
            fn(code, msg, isErr);
        } catch (err) {
            log.track(err);
        }
    }

    /// Publishes msg and awaits for the response.
    public pub$<T = OkMsg>(
        code: string, msg: Msg, opts: PubOpts = DEFAULT_PUB_OPTS
    ): Observable<Res<T>> {
        return this.pubFull$<T>(code, msg, opts).pipe(
            map(v => {
                if (v.is_err()) {
                    return v;
                }
                return Ok(v.ok.msg);
            })
        );
    }

    public pubFull$<T = OkMsg>(
        code: string, msg: Msg, opts: PubOpts = DEFAULT_PUB_OPTS
    ): Observable<Res<{code: string; msg: T}>> {
        const subject$ = new ReplaySubject<{
            code: string; msg: Msg; isErr: boolean;
        }>();
        const subfn = (
            code: string, 
            msg: Msg, 
            isErr: boolean
        ): void => subject$
        .next({
            code: code,
            msg: msg,
            isErr: isErr
        });
        this.pub(code, msg, subfn, opts);
        return subject$.asObservable().pipe(
        map(data => {
            if (data.isErr) {
                if (data.msg instanceof ErrCls) {
                    return data.msg;
                }
                return Err(data.msg.msg);
            }
            return Ok({code: data.code, msg: data.msg});
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
        if (!this.isWelcomeArrived()) {
            this.onWelcome.enqueue(() => {
this.pub(code, msg, fn, opts);
});
            return Ok(undefined);
        }

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
        let isErr = opts._isErr === true;
        codeData.isErr = isErr;
        codeData.lastMsg = msg;

        let sid = uuid4();
        if (fn !== undefined) {
            let initialCodeSuffix = undefined;
            if (Object.hasOwn(msg, "collection")) {
                initialCodeSuffix = msg.collection;
            }
            this.awaitingForResponse.set(
                sid,
                {
                    initialCode: code, 
                    initialCodeSuffix: initialCodeSuffix, 
                    fn: fn
                }
            );
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
                    this.callSubFn(codeData.fn, code, msg, isErr);
                }
            }
        }

        // send as response
        if (opts._lsid !== undefined) {
            let awaitingFn = this.awaitingForResponse.get(opts._lsid);
            if (awaitingFn !== undefined) {
                this.callSubFn(awaitingFn.fn, code, msg, isErr);
                // clear after satisfying with the response
                this.awaitingForResponse.delete(opts._lsid);
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

    /// Unsub every item in array, clearing on the go.
    public unsubArr(arr: (() => void)[]) {
        for (let i = arr.length - 1; i > 0; i--) {
            let unsub = arr.pop();
            if (unsub !== undefined) {
                unsub();
            }
        }
    }

    private welcome(raw: any): void {
        log.info("receive welcome");
        let codes = raw.msg.codes;
        if (codes === undefined) {
            panic("incorrect welcome message composition");
        }
        this.codes = codes;
        this.codesData.clear();
        for (let code of this.codes) {
            this.codesData.set(
                code,
                {
                    isErr: false,
                    lastMsg: undefined,
                    subs: new Map()
                }
            );
        }

        let deferredCount = this.onWelcome.length;
        while (this.onWelcome.length > 0) {
            this.onWelcome.dequeue()();
        }
        log.info(`executed ${deferredCount} welcome-deferred functions`);
    }

    private recv(raw: any): void {
        if (
            !this.isWelcomeArrived()
            || raw.codeid == StaticCodeids.Welcome
        ) {
            // welcome msg is not logged as NET::RECV
            this.welcome(raw);
            return;
        }

        if (!this.isWelcomeArrived() && raw.codeid != StaticCodeids.Welcome) {
            log.err(
                "no welcome is arrived, but other messages".concat(
                    "from the net are received"
                )
            );
            return;
        }

        let bmsg_r = de(raw);
        if (bmsg_r.is_err()) {
            log.track(bmsg_r, "bus receive");
            return;
        }
        let bmsg = bmsg_r.ok;
        let codeid = bmsg.codeid;
        let code_r = this.getCodeByCodeid(codeid);
        if (code_r.is_err()) {
            log.track(bmsg_r, `codeid ${codeid} unpack`);
            return;
        }
        let code = code_r.ok;

        let to = "";
        if (bmsg.lsid !== undefined) {
            let awaitingResponse = this.awaitingForResponse.get(bmsg.lsid);
            let linkedCode = awaitingResponse?.initialCode;
            let suffix = awaitingResponse?.initialCodeSuffix;
            if (linkedCode !== undefined) {
                to = linkedCode;
                // add suffix only if linked code is defined
                if (suffix !== undefined) {
                    to += "::" + suffix;
                }
            }
        }
        let log_msg = `NET::RECV | ${code} -> ${to} | ${JSON.stringify(raw)}`;
        if (bmsg.is_err === true) {
            log.err(log_msg);
        } else {
            log.info(log_msg);
        }

        let final_msg = bmsg.msg;
        // add code to errors, and convert them to classes, since the original
        // err's code is moved to the bmsg's top-level field from the msg's nested
        // body
        if (bmsg.is_err) {
            final_msg = Err(
                final_msg.msg,
                code
            );
        }

        this.pub(
            code_r.ok as string,
            final_msg,
            undefined,
            // disallow duplicate net resending
            {
                ...DEFAULT_PUB_OPTS,
                skipNet: true,
                _lsid: bmsg.lsid,
                _isErr: bmsg.is_err
            }
        );
    }

    private recvErr(err: any): void {
        let msg =
            "client bus connection is closed with error: " + err;
        this.alertSv.spawn({
            level: AlertLevel.Error,
            msg: msg
        });
        log.err(msg);
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
    );
}