/**
 * Extended functionality for client-side browser storages.
 */

import { NotFoundError, TypeExpectError } from "./err";

// TODO(ryzhovalex):
//    in order to implement the session storage utils, consider creating a
//    base class with base functionality, since API of local and session
//    storages should be similar.

export abstract class LocalStorageUtils
{
  public static setObject(key: string, obj: object): void
  {
    return localStorage.setItem(key, JSON.stringify(obj));
  }

  public static getObject(key: string): object
  {
    const rawobj: string | null = localStorage.getItem(key);

    if (rawobj === null)
    {
      throw new NotFoundError("object with key", key);
    }

    const result: object = JSON.parse(rawobj);

    if (typeof result !== "object")
    {
      throw new TypeExpectError("result", "object", typeof result);
    }

    return result;
  }

  /**
   * Same as getObject, but ensures that an array is received.
   */
  public static getArray(key: string): object[]
  {
    const result: object = this.getObject(key);

    if (!Array.isArray(result))
    {
      throw new TypeExpectError("result", "array", typeof result);
    }

    return result;
  }

  /**
   * Same as getObject, but ensures that a base object is received.
   */
  public static getBaseObject(key: string): object
  {
    const result: object = this.getObject(key);

    if (Array.isArray(result))
    {
      throw new TypeExpectError("result", "base object", typeof result);
    }

    return result;
  }

  /**
   * Pushes a new item to storage's array.
   */
  public static pushArrayItem(key: string, item: object): void
  {
    const array: object[] = [...this.getArray(key)];
    array.push(item);
    this.setObject(key, array);
  }

  /**
   * Sets a new field for non-array (i.e. base) object.
   */
  public static setObjectField(
    key: string,
    fieldKey: string,
    fieldValue: object
  ): void
  {
    const newLooseObj: {[k: string]: object} = {...this.getBaseObject(key)};
    newLooseObj[fieldKey] = fieldValue;
    this.setObject(key, newLooseObj);
  }
}
