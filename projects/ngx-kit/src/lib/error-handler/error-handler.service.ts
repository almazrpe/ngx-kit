import { HttpErrorResponse } from "@angular/common/http";
import { Injectable, NgZone } from "@angular/core";
import { AlertService } from "../alert/alert.service";
import { AlertLevel } from "../alert/models";
import { HostDTO } from "../dto";
import { LogService } from "../log/log.service";
import { TranslationOptions } from "../i18n/options";
import {
  I18nService
} from "../i18n/i18n.service";
import Codes from "ngx-kit/_auto_codes";
import { BaseError, NotFoundError } from "ngx-kit/errors";

@Injectable({
  providedIn: "root"
})
export class ErrorHandlerService
{

  public constructor(
    private log: LogService,
    private alertService: AlertService,
    private translation: I18nService,
    private ngZone: NgZone,
  ) { }

  public handle(error: Error): void
  {
    let errorCode: string;
    const translationOptions: TranslationOptions = {};

    if (error instanceof HttpErrorResponse)
    {
      const dto: HostDTO = error.error as HostDTO;

      if (
        dto.value === undefined
        || dto.value.code === undefined
        || dto.value.code === null
      )
      {
        errorCode = Codes.almaz.ngx_kit.errors.error.server;
      }
      else
      {
        errorCode = dto.value.code as string;
      }
    }
    else if (error instanceof BaseError)
    {
      errorCode = (error as any).Code;
    }
    else
    {
      errorCode = Codes.almaz.ngx_kit.errors.error.client;
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

      errorCode = Codes.almaz.ngx_kit.errors.error.client;
    }

    this.ngZone.runTask(() => this.alertService.spawn({
      level: AlertLevel.Error,
      // the result is already capitalized if the according translation
      // option given (or by default)
      message: res + ` (${errorCode})`
    }));

    this.log.error(
      "unhandled error: " + JSON.stringify(error)
    );
  }
}
