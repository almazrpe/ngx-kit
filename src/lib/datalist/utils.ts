import { DatalistOption } from "./datalist-option";

export abstract class DatalistUtils {
  public static isDatalistOption(value: any): value is DatalistOption {
    return Object.hasOwn(value, "value");
  }
}
