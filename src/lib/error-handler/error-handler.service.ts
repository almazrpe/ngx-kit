import { Injectable, NgZone } from "@angular/core";
import { AlertService } from "../alert/alert.service";
import { AlertLevel } from "../alert/models";
import { TranslationOptions } from "../i18n/options";
import {
  I18nService
} from "../i18n/i18n.service";
import { BaseError, NotFoundError } from "../errors";

@Injectable({
  providedIn: "root"
})
export class ErrorHandlerService
{

  public constructor(
    private alertService: AlertService,
    private translation: I18nService,
    private ngZone: NgZone,
  ) { }

  public handle(error: Error): void
  {
    let errorCode: string;
    const translationOptions: TranslationOptions = {};

    if (error instanceof BaseError)
    {
      errorCode = (error as any).Code;
    }
    else
    {
      errorCode = "client-err";
    }

    let res: string;
    try
    {
      res = this.translation.getTranslation(
        errorCode,
        translationOptions
      );
    }
    catch (err: any)
    {
      if (err instanceof NotFoundError)
      {
        res = "untranslated error with code \"" + errorCode + "\"";
      }
      else
      {
        res = "unknown error on translation retrieval";
        error = err as Error;
      }

      errorCode = "client-err";
    }

    this.ngZone.runTask(() => this.alertService.spawn({
      level: AlertLevel.Error,
      // the result is already capitalized if the according translation
      // option given (or by default)
      message: res + ` (${errorCode})`
    }));

    console.error(error);
  }
}
