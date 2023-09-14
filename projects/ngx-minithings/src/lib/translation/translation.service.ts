import { Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { Observable, map, take } from "rxjs";
import { Modifier } from "./modifier";
import { capitalize } from "../str/str";
import { TranslationOptions } from "./options";

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
    if (options === undefined)
    {
      options = {};
    }

    let finalTranslationKey: string;
    if (
      options.modifier === undefined || options.modifier === Modifier.DEFAULT
    )
    {
      finalTranslationKey = key + ".$";
    }
    else
    {
      finalTranslationKey = key + ".$" + options.modifier;
    }

    const isCapitalized: boolean =
      options.isCapitalized !== undefined ? options.isCapitalized : true;

    return this.nativeTranslation.get(
      finalTranslationKey,
      options.params
    ).pipe(
      map((res: string) =>
      {
        // due to special design, ngx-translate returns the key passed, if the
        // according value is not found, so here we throw an error instead for
        // such cases
        if (res === finalTranslationKey)
        {
          throw Error(
            `a translation for a key ${finalTranslationKey} was not found`
          );
        }
        else
        {
          return isCapitalized ? capitalize(res) : res;
        }
      }),
      take(1)
    );
  }
}
