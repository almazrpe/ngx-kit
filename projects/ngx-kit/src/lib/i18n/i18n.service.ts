import { Injectable } from "@angular/core";
import { TranslationOptions } from "./options";
import { NotFoundError, PleaseDefineError } from "../errors";
import { I18nConfig } from "./config";
import { TranslationMapByLang } from "./translation";
import { TranslationModifier } from "./modifier";

@Injectable({
  providedIn: "root"
})
export class I18nService
{
  private lang?: string;
  private defaultLang: string = "en";
  private translationMapByLang: TranslationMapByLang;

  public constructor()
  {
    this.setup({lang: "en"});
  }

  /**
   * Only defined fields of config are rewritten, others are ignored.
   */
  public setup(config: I18nConfig): void
  {
    if (config.lang !== undefined)
    {
      this.lang = config.lang;
    }
    if (config.defaultLang !== undefined)
    {
      this.defaultLang = config.defaultLang;
    }
    if (config.translationMapByLang !== undefined)
    {
      this.translationMapByLang = config.translationMapByLang;
    }
  }

  public getTranslation(
    code: string,
    options?: TranslationOptions
  ): string
  {
    if (this.translationMapByLang === undefined)
    {
      throw new PleaseDefineError(
        "translation retrieve",
        "config.translationMapByLang"
      );
    }

    let finalOptions: TranslationOptions = {};
    if (options !== undefined)
    {
      finalOptions = options;
    }

    const isCapitalized: boolean = finalOptions.isCapitalized !== undefined
      ? finalOptions.isCapitalized : true;

    let finalLang: string = this.defaultLang;
    if (this.lang !== undefined)
    {
      finalLang = this.lang;
    }

    let finalModifier: string = TranslationModifier.Default;
    if (finalOptions.modifier !== undefined)
    {
      finalModifier = finalOptions.modifier;
    }

    let translation: string;
    try
    {
      translation =
        this.translationMapByLang[finalLang][code][finalModifier];
    }
    catch (err)
    {
      if (finalOptions.fallbackTranslation === undefined)
      {
        throw new NotFoundError(
          "a translation for code " + code,
          finalOptions
        );
      }
      translation = finalOptions.fallbackTranslation;
    }

    if (finalOptions.params !== undefined)
    {
      for (const key in finalOptions.params)
      {
        translation.replaceAll("${" + key + "}", finalOptions.params[key]);
      }
    }

    // TODO(ryzhovalex):
    //    check that not variable brackets are left, to avoid errors

    if (finalOptions.isCapitalized === true)
    {
      translation = translation[0].toUpperCase() + translation.slice(1);
    }

    return translation;
  }
}
