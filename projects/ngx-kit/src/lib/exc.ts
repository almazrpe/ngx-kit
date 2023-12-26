import { code } from "./tmp-keycode";

/**
 * Base error is a client side by default.
 */
@code("almaz.ngx-kit.exc.exception.client")
export class Exception extends Error
{
  public s?: string;

  public constructor(
    s?: string
  )
  {
    super(s);
    this.s = s;
  }
}

@code("almaz.ngx-kit.exc.exception.server")
export class ServerException extends Exception
{
}

@code("almaz.ngx-kit.exc.exception.not-found")
export class NotFoundException extends Exception
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

@code("almaz.ngx-kit.exc.exception.duplicate-name")
export class DuplicateNameException extends Exception
{
  public duplicatedName?: string;

  public constructor(s?: string, duplicatedName?: string)
  {
    super(s);
    this.duplicatedName = duplicatedName;
  }
}

@code("almaz.ngx-kit.exc.exceptions.please-define")
export class PleaseDefineException extends Exception
{
  public constructor(
    s?: string,
    cannotDo?: string,
    pleaseDefine?: string
  )
  {
    let msg: string | undefined;
    msg = s;
    if (s === undefined)
    {
      msg = `cannot do ${cannotDo}: please define ${pleaseDefine}`;
    }
    super(msg);
  }
}

@code("almaz.ngx-kit.exc.exception.expect")
export class ExpectException extends Exception {}

@code("almaz.ngx-kit.exc.exception.unsupported")
export class UnsupportedException extends Exception
{
  public constructor(
    s?: string
  )
  {
    super(s);
  }
}

@code("almaz.ngx-kit.exc.exception.assert")
export class AssertException extends Exception
{
  public constructor(
    s?: string
  )
  {
    super(s);
  }
}
