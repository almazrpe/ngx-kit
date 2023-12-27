import { code } from "./tmp-keycode";

/**
 * Base error is a client side by default.
 */
@code("almaz.ngx-kit.errors.error.client")
export class BaseError extends Error
{
  public s?: string;
  public static Code: string;

  public constructor(
    s?: string
  )
  {
    super(s);
    this.s = s;
  }
}

@code("almaz.ngx-kit.errors.error.server")
export class ServerError extends BaseError
{
}

@code("almaz.ngx-kit.errors.error.not-found")
export class NotFoundError extends BaseError
{
  public options: any;

  public constructor(s?: string, options?: any)
  {
    let message: string = "not found";

    if (s !== undefined)
    {
      message = s + " " + message;
    }

    if (options !== undefined)
    {
      message += `for options: ${JSON.stringify(options)}`;
    }

    super(message);
    this.options = options;
  }
}

@code("almaz.ngx-kit.errors.error.duplicate-name")
export class DuplicateNameError extends BaseError
{
  public duplicatedName?: string;

  public constructor(s?: string, duplicatedName?: string)
  {
    super(s);
    this.duplicatedName = duplicatedName;
  }
}

@code("almaz.ngx-kit.errors.error.please-define")
export class PleaseDefineError extends BaseError
{
  public constructor(
    cannotDo?: string,
    pleaseDefine?: string
  )
  {
    const msg: string =
      `cannot do ${cannotDo}: please define ${pleaseDefine}`;
    super(msg);
  }
}

@code("almaz.ngx-kit.errors.error.expect")
export class ExpectError extends BaseError {}

@code("almaz.ngx-kit.errors.error.type-expect")
export class TypeExpectError extends BaseError
{
  public constructor(s?: string, expected?: string, actual?: string)
  {
    let msg: string = s + " type";
    if (expected !== undefined)
    {
      msg += ", expected " + expected;
    }
    if (actual !== undefined)
    {
      msg += ", got " + actual;
    }
    super(msg);
  }
}

@code("almaz.ngx-kit.errors.error.unsupported")
export class UnsupportedError extends BaseError
{
  public constructor(
    s?: string
  )
  {
    super(s);
  }
}
