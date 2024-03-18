export abstract class log
{
  public static debug(...args: any[]): void
  {
    console.debug(args.map(a => JSON.stringify(a)).join(","));
  }

  public static info(msg: any): void
  {
    console.info(msg);
  }

  public static warn(msg: any): void
  {
    console.warn(msg);
  }

  public static err(msg: any): void
  {
    console.error(msg);
  }

  public static catch(err: any): void
  {
    const fmsg: string =
      err.name + ": " + (err.message !== "" ? err.message : "<empty-msg>");

    const stack = err.stack;
    if (stack !== undefined)
    {
      // do not attach stack to console - too long
      // fmsg = fmsg + "\n\t-> " + stack.trimEnd().replaceAll("\n", "\n\t-> ");
    }

    console.error(fmsg);
  }
}
