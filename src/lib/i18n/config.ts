import { TranslationMapByLang } from "./translation";

export interface I18nConfig
{
  // you can specify any language (two letter, three letter, etc.)
  // it will be matched only with defined translations and how they are named
  lang?: string;
  defaultLang?: string;
  /**
   * Defined translations.
   *
   * In terms in performance, this can be very heavy operations since the
   * map might be big. In future we plan to implement async loading of this.
   */
  translationMapByLang?: TranslationMapByLang;
}
