import { HttpClient } from "@angular/common/http";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";

export function createHttpLoader(
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
