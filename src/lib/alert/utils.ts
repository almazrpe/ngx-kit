import { AlertLevel } from "./models";

export abstract class AlertUtils {
  public static isAlertLevel(value: any): value is AlertLevel {
    return Object.values(AlertLevel).includes(value);
  }
}
