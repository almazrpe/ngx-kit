import { TranslationModifier } from "./modifier";

export interface TranslationOptions {
  modifier?: TranslationModifier;
  params?: { [key: string]: any };
  isCapitalized?: boolean;

  /**
   * String to be used if a translation is not found.
   *
   * Note that translation options given, such as capitalization flag,
   * do not affect fallback translation string, i.e. it is returned as it is.
   */
  fallbackTranslation?: string;
}
