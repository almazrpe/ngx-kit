export abstract class StringUtils
{
  public static readonly AlphanumericCharacters: string =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  public static capitalize(s: string): string
  {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  public static getTitledValue(title?: string, value?: string): string
  {
    if (title === undefined && value === undefined)
    {
      return "";
    }

    if (title === undefined && value !== undefined)
    {
      return `<${value}>`;
    }

    if (title !== undefined && value === undefined)
    {
      return title;
    }

    if (title !== undefined && value !== undefined)
    {
      return `${title}=<${value}>`;
    }

    throw new Error("unexpected endpoint");
  }

  /**
   * Generate random string id.
   *
   * @param len Length of the id to be generated. Defaults to 15 chars
   * @return String id
   * @see https://stackoverflow.com/a/1349426
   */
  public static makeid(len?: number): string
  {
    if (len == null || len == 0)
    {
      len = 15;
    }

    let result: string = "";
    const charactersLength: number = this.AlphanumericCharacters.length;

    for (let i: number = 0; i < len; i++)
    {
      result += this.AlphanumericCharacters.charAt(
        Math.floor(Math.random() * charactersLength)
      );
    }

    return result;
  }
}
