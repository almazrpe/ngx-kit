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
import { BaseError } from "ngx-kit/err";

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
        errorCode = Codes.almaz.ngx_kit.err.error.server;
      }
      else
      {
        errorCode = dto.value.code as string;
      }
    }
    else if (error instanceof BaseError)
    {
      errorCode = error.constructor.prototype.Code;
      console.log(errorCode);
    }
    else
    {
      errorCode = Codes.almaz.ngx_kit.err.error.client;
    }

    this.translation.getTranslation(
      errorCode,
      translationOptions
    ).subscribe((res: string) =>
    {
      this.ngZone.runTask(() => this.alertService.spawn({
        level: AlertLevel.Error,
        // the result is already capitalized if the according translation
        // option given (or by default)
        message: res + ` (${errorCode})`
      })
      );
    });
  }
}
