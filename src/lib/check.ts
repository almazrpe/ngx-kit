export class CheckErr extends Error
{
}

export abstract class check
{
  public static run(condition: boolean, msg?: string): void
  {
    if (!condition)
    {
      throw new CheckErr(msg);
    }
  }

  public static instance(obj: any, t: any): void
  {
    if (!(obj instanceof t))
    {
      throw new CheckErr(`${obj} must be instance of ${t}`);
    }
  }
}

