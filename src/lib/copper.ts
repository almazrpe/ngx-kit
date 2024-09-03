//! Provides core functionality for better typescript experience.

export interface ResItem<T = any> {
    is_ok: () => this is OkCls<T>;
    is_err: () => this is ErrCls;
    ok: () => T | undefined;
    err: () => ErrCls | undefined;
    unwrap: () => T;
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

    public ok(): T {
        return this.val;
    }

    public err(): undefined {
        return;
    }

    public unwrap(): T {
        return this.val;
    }
}

export function panic(msg?: string): never {
    throw new ErrCls(msg, ecode.Panic);
}

// TODO: support stacktrace
export class ErrCls extends Error implements ResItem {
    code: string;
    msg: string | undefined;

    public constructor(msg?: string, code: string = ecode.Err) {
        super();
        this.code = code;
        this.msg = msg;
    }

    public is(code: string): boolean {
        return this.code == code;
    }

    public is_ok(): this is OkCls<any> {
        return false;
    }

    public is_err(): this is ErrCls {
        return true;
    }

    public ok(): undefined {
        return;
    }

    public err(): this {
        return this;
    }

    public unwrap(): never {
        throw this;
    }

    public static from_native(err: Error): ErrCls
    {
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
        return ErrCls.from_native(err as Error);
    }
}

