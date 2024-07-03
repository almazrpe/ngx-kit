import { NotFoundErr } from "./err";
import { log } from "./log";

export abstract class ArrUtils
{
  public static getFirst<T>(arr: T[], is_warned: boolean = true): T
  {
    if (arr.length == 0)
    {
      throw new NotFoundErr("arr contents");
    }
    if (arr.length > 1 && is_warned)
    {
      log.warn(
        "arr "
        + arr.map(v => JSON.stringify(v)).join(" ;; ")
        + ` of length more than 1 given (${arr.length}) => take only first`
      );
    }
    return arr[0];
  }
}
