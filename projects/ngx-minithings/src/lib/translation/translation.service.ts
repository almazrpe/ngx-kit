import { Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { Observable, map, of, take } from "rxjs";
import { GetFromCodesMapArgs, TranslationModifier } from "./models";
import { TranslationOptions } from "./options";
import { StringUtils } from "ngx-minithings/str/utils";
import { NotFoundError, PleaseDefineError } from "@slimebones/ngx-antievil";

@Injectable({
  providedIn: "root"
})
export class TranslationService
{

  public constructor(
    private nativeTranslation: TranslateService
  )
  {
    nativeTranslation.setDefaultLang("ru");
    nativeTranslation.use("ru");
  }

  public get(
    key: string,
    options?: TranslationOptions
  ): Observable<string>
  {
    let finalOptions: TranslationOptions = {};
    if (options !== undefined)
    {
      finalOptions = options;
    }

    let finalTranslationKey: string;
    if (
      finalOptions.modifier === undefined
      || finalOptions.modifier === TranslationModifier.Default
    )
    {
      finalTranslationKey = key + ".$";
    }
    else
    {
      finalTranslationKey = key + ".$" + finalOptions.modifier;
    }

    const isCapitalized: boolean = finalOptions.isCapitalized !== undefined
      ? finalOptions.isCapitalized : true;

    return this.nativeTranslation.get(
      finalTranslationKey,
      finalOptions.params
    ).pipe(
      map((res: string) =>
      {
        // due to special design, ngx-translate returns the key passed, if the
        // according value is not found, so here we throw an error instead for
        // such cases, but only if a fallback translation is not specified
        if (
          res === finalTranslationKey
          && finalOptions.fallbackTranslation === undefined
        )
        {
          throw new NotFoundError(
            "a translation for a key",
            finalTranslationKey,
            options
          );
        }
        else if (
          res === finalTranslationKey
          && finalOptions.fallbackTranslation !== undefined
        )
        {
          // note that capitalization and other options do not affect fallback
          // translation string
          return finalOptions.fallbackTranslation;
        }

        return isCapitalized ? StringUtils.capitalize(res) : res;
      }),
      take(1)
    );
  }

  /**
   * Searches translation codes objects for required key.
   *
   * @param key code key to search for
   * @param codes code map to search in
   * @param fallback fallback translations to pick from using the key
   * @throws NotFoundError no code is found for given key in code maps and
   *   fallback translations
   * @returns translated string either using code from the code maps or ready
   *   translation from the fallback map
   */
  public getFromCodesMap(
    args: GetFromCodesMapArgs
  ): Observable<string>
  {
    if (args.codes === undefined && args.fallback === undefined)
    {
      throw new PleaseDefineError(
        "getting translation from code map",
        "either codes or/and fallback translations"
      );
    }

    if (args.codes !== undefined && Object.hasOwn(args.codes, args.key))
    {
      const code: string | undefined = args.codes[args.key];

      if (code !== undefined)
      {
        return this.get(args.key, args.options);
      }
    }

    if (args.fallback !== undefined && Object.hasOwn(args.fallback, args.key))
    {
      return of(args.fallback[args.key]);
    }

    throw new NotFoundError(
      "code value for key",
      args.key,
      {
        codes: args.codes,
        fallback: args.fallback
      }
    );
  }

}
