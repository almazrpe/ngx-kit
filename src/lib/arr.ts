import { NotFoundErr } from "./err";
import { log } from "./log";

export abstract class ArrUtils
{
  public static getOnlyFirstOrErr<T>(arr: T[]): T
  {
    if (arr.length == 0)
    {
      throw new NotFoundErr("arr contents");
    }
    if (arr.length > 1)
    {
      log.err(
        "arr "
        + arr.map(v => JSON.stringify(v)).join(", ")
        + " of length more than 1 given => take first and ignore"
      );
    }
    return arr[0];
  }
}
