export abstract class DTUtils
{
  /**
   * Converts UNIX timestamp to current local Date.
  */
  public static convertTimestamp(timestamp: number): Date
  {
    return new Date(timestamp * 1000);
  }
}
