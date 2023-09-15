import { Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { Observable, map, take } from "rxjs";
import { Modifier } from "./models";
import { TranslationOptions } from "./options";
import { StringUtils } from "ngx-minithings/str/str";
import { NotFoundError } from "@slimebones/ngx-antievil";

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
      || finalOptions.modifier === Modifier.Default
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
}
