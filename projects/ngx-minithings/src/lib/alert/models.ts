export enum AlertLevel {
  INFO = 0,
  WARNING = 1,
  ERROR = 2,
}

export interface Alert {
  level: AlertLevel;
  message: string;
}
