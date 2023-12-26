import { HttpErrorResponse } from "@angular/common/http";
import { Injectable, NgZone } from "@angular/core";
import { AlertService } from "../alert/alert.service";
import { AlertLevel } from "../alert/models";
import { HostDTO } from "../dto";
import { LogService } from "../log/log.service";
import { TranslationOptions } from "../translation/options";
import {
  TranslationService
} from "../translation/translation.service";
import Codes from "ngx-kit/_auto_codes";
import { Exception } from "ngx-kit/exc";

@Injectable({
  providedIn: "root"
})
export class ErrorHandlerService
{

  public constructor(
    private log: LogService,
    private alertService: AlertService,
    private translation: TranslationService,
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
        errorCode = Codes.almaz.ngx_kit.exc.exception.server;
      }
      else
      {
        errorCode = dto.value.code as string;
      }
    }
    else if (error instanceof Exception)
    {
      // errorCode = CodeStorage.getCode<>();
      errorCode = "stub";
    }
    else
    {
      errorCode = Codes.almaz.ngx_kit.exc.exception.client;
    }

    this.translation.get(
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
