import {BaseError} from "@slimebones/ngx-antievil";

export class NoKeyboardFocusError extends BaseError
{
  public override Code = "error.no-keyboard-focus";
}
