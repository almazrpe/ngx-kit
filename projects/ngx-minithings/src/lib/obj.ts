export abstract class ObjectUtils
{
  public static isEmpty(obj: object): boolean
  {
    return Object.keys(obj).length === 0;
  }
}
