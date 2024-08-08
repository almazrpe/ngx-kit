export abstract class DTUtils
{
  public static timezoneOffset: number =
    (new Date()).getTimezoneOffset() * 60000;

  public static getComparativeDateString(dt: Date): string
  {
    return (new Date(
      dt.getTime() - DTUtils.timezoneOffset
    )).toISOString().slice(0, 10);
  }

  public static getConvertedTime(): number
  {
    return Date.now() / 1000;
  }

  /**
   * Converts UNIX timestamp to current local Date.
  */
  public static convertTimestamp(timestamp: number): Date
  {
    return new Date(timestamp * 1000);
  }
}
