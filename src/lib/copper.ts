//! Provides the core functionality for a better typescript experience.

import { Observable, ReplaySubject, UnaryFunction, catchError, map, of, pipe } from "rxjs";
import { log } from "../public-api";

export interface ResItem<T = any> {
    is_ok(): this is OkCls<T>;
    is_err(): this is ErrCls;
    get ok(): T | undefined;
    get err(): ErrCls | undefined;
    unwrap(): T
}

export function Ok<T>(val: T): OkCls<T> {
    return new OkCls(val);
}

export function Err(msg?: string, code?: string): ErrCls {
    return new ErrCls(msg, code);
}

export function ErrFromNative(err: Error): ErrCls {
    return ErrCls.from_native(err);
}

export class OkCls<T> implements ResItem<T> {
    private val: T;

    public constructor(val: T) {
        this.val = val;
    }

    public is_ok(): this is OkCls<T> {
        return true;
    }

    public is_err(): this is ErrCls {
        return false;
    }

    public get ok(): T {
        return this.val;
    }

    public get err(): undefined {
        return;
    }

    public unwrap(): T {
        return this.val;
    }
}

// TODO: support stacktrace
export class ErrCls extends Error implements ResItem {
    public code: string
    public msg: string | undefined
    public extra?: {[key: string]: any}

    public constructor(
        msg?: string,
        code: string = ecode.Err,
        extra?: {[key: string]: any}
    ) {
        super()
        this.code = code
        this.msg = msg
        this.extra = extra
    }

    public setExtraField(
        k: string,
        val: any
    ) {
        if (!def(this.extra)) {
            this.extra = {}
        }
        this.extra[k] = val
    }

    public getExtraField<T>(
        k: string, defaultVal: Option<T> = undefined
    ): Option<T>  {
        if (!def(this.extra) || !def(this.extra[k])) {
            return defaultVal
        }
        return this.extra[k]
    }

    public display() {
        if (this.msg === undefined) {
            return this.code;
        }
        return `${this.code}:: ${this.msg}`;
    }

    public is(...codes: string[]): boolean {
        return codes.includes(this.code);
    }

    public is_ok(): this is OkCls<any> {
        return false;
    }

    public is_err(): this is ErrCls {
        return true;
    }

    public get ok(): undefined {
        return;
    }

    public get err(): this {
        return this;
    }

    public unwrap(): never {
        throw this;
    }

    public static from_native(err: Error): ErrCls {
        return new ErrCls(err.message, ecode.Err);
    }
}

export enum ecode {
    Err = "err",
    Panic = "panic_err",
    Val = "val_err",
    NotFound = "not_found_err",
    AlreadyProcessed = "already_processed_err",
    Unsupported = "unsupported_err",
    Lock = "lock_err"
}

export type Res<T> = OkCls<T> | ErrCls;

/// Calls a function and wraps retval to [`Res`] - to [`Err`] on thrown
/// exception and to [`Ok`] otherwise.
///
/// Useful to integrate non-result functions.
export function resultify<T>(fn: () => T): Res<T> {
    try {
        let r = fn();
        return Ok(r);
    } catch (err) {
        return ErrFromNative(err as Error);
    }
}

/// Wraps function raised error into `Err(e)`, or returns the retval as it is.
///
/// Useful to ensure that result-based function never throws.
export function secure<T>(fn: () => Res<T>): Res<T> {
    try {
        return fn();
    } catch (err) {
        return ErrFromNative(err as Error);
    }
}

export function panic(msg?: string): never {
    throw new ErrCls(msg, ecode.Panic);
}

export function assert(condition: boolean, msg?: string): void {
    if (!condition) {
        panic(msg);
    }
}

export function pipeResultify<T>(): RxPipe<T, Res<T>> {
    return pipe(
        map(v => {
            return Ok(v);
        }),
        catchError(err => {
            return of(ErrFromNative(err));
        })
    );
}

export type RxPipe<TInp, TOut> = UnaryFunction<
    Observable<TInp>, Observable<TOut>
>

export function pipeResSecure<T>(): RxPipe<Res<T>, Res<T>> {
    return pipe(
        catchError(err => {
            return of(ErrFromNative(err));
        })
    );
}

export function pipeResUnwrap<T>(): RxPipe<Res<T>, T> {
    return pipe(
        map(val => {
            return val.unwrap();
        })
    );
}

export function pipeDebug(): RxPipe<any, any> {
    return pipe(
        map(val => {
            log.debug(val);
            return val;
        })
    );
}

export function pipeWarn(): RxPipe<any, any> {
    return pipe(
        map(val => {
            log.warn(val);
            return val;
        })
    );
}

export function pipeResTakeFirst<T>(): RxPipe<T[], Res<T>> {
    return pipe(
        map(val => {
            if (val.length == 0) {
                return Err("empty arr to take from");
            }
            return Ok(val[0]);
        })
    );
}

export function pipeResTakeFirstUnwrap<T>(): RxPipe<T[], T> {
    return pipe(
        pipeResTakeFirst(),
        pipeResUnwrap()
    );
}

export function pipeResOkOrEmptyArr<T>(): RxPipe<Res<T[]>, T[]> {
    return pipe(
        map(val => {
            if (val.is_err()) {
                return [];
            }
            return val.ok;
        })
    );
}

export function pipeResOkOrUndefined<T>(): RxPipe<Res<T>, T | undefined> {
    return pipe(
        map(val => {
            if (val.is_err()) {
                return undefined;
            }
            return val.ok;
        })
    );
}

export function pipeResOkOrNull<T>(): RxPipe<Res<T>, T | null> {
    return pipe(
        map(val => {
            if (val.is_err()) {
                return null;
            }
            return val.ok;
        })
    );
}

export class Signal extends ReplaySubject<number> {
    public signal() {
        this.next(1)
    }
}

// In typescript we generally prefer to work with undefined, instead of null,
// but to cover both cases we use this function, to not care about which
// specific "unset" object we deal with.
export type nil = null | undefined

/**
 * @deprecated Use `val !== undefined`.
 */
export function def<T>(val: T | nil): val is T {
    return val !== undefined && val !== null;
}

// Convert null to undefined to be able to use question marks.
export function qq<T>(val: T | undefined | null): T | undefined {
    if (val === null) {
        return undefined
    }
    return val
}

/**
 * @deprecated Use `arg?: T` instead.
 */
export type Option<T> = T | undefined
export type Ret<T> = T | Error

export function ee(r: any): r is Error {
    return r instanceof Error
}

export function unwrap<T>(r: Ret<T>): T {
    if (ee(r)) {
        throw r
    }
    return r
}

export function wrap<T>(fn: () => T): Ret<T> {
    try {
        let r = fn()
        return r
    } catch (err) {
        if (!ee(err)) {
            throw new Error(`Cannot accept non-err type ${err}.`)
        }
        return err
    }
}

export function pipeUnwrap<T>(): RxPipe<Ret<T>, T> {
    return pipe(
        map(val => {
            return unwrap(val)
        })
    );
}

export function pipeFirstOrNil<T>(): RxPipe<Ret<T>, T | nil> {
    return pipe(
        map(val => {
            if (ee(val)) {
                return undefined
            }
            return val
        })
    );
}

export function fromRes<T>(res: Res<T>): Ret<T> {
    if (ee(res)) {
        return res
    }
    return res.ok
}

export function pipeFromRes<T>(): RxPipe<Res<T>, Ret<T>> {
    return pipe(
        map(val => {
            return fromRes(val)
        })
    )
}
