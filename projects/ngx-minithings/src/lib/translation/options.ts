import { Modifier } from "./modifier";

export interface TranslationOptions {
  modifier?: Modifier;
  params?: { [key: string]: unknown };
  isCapitalized?: boolean;
}
