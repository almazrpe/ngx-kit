export abstract class DTUtils
{
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
