import { HttpClient } from "@angular/common/http";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";

export abstract class TranslationUtils
{
  /**
   * Searches translation codes objects for required key and returns from
   * the first object where the key is found.
   */
  public static getTranslationCode(
    key: string
  )

  public static createHttpLoader(
    http: HttpClient,
    path: string,
    extension: string
  ): TranslateHttpLoader
  {
    return new TranslateHttpLoader(
      http,
      path,
      extension
    );
  }
}
