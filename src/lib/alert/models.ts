export enum AlertLevel {
  Info = 0,
  Warning = 1,
  Error = 2,
}

export interface Alert {
  level: AlertLevel;
  message: string;
}

export interface AlertUrls
{
  info: string;
  warning: string;
  error: string;
}
