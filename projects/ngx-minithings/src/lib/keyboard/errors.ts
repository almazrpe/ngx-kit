import { ErrorCode } from "src/app/helpers/codes";
import { BaseError } from "src/app/utils/errors";

export class NoKeyboardFocusError extends BaseError
{
  public override CODE = ErrorCode.NO_KEYBOARD_FOCUS;
}
