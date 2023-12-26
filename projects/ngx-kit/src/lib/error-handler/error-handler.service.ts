import { HttpErrorResponse } from "@angular/common/http";
import { Injectable, NgZone } from "@angular/core";
import { BaseError, CoreErrorCode } from "@slimebones/ngx-antievil";
import { AlertService } from "../alert/alert.service";
import { AlertLevel } from "../alert/models";
import { HostDTO } from "../dto";
import { LogService } from "../log/log.service";
import { TranslationOptions } from "../translation/options";
import {
  TranslationService
} from "../translation/translation.service";

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
    let translationOptions: TranslationOptions = {};
    let isAlertSpawned: boolean = true;
    let isLogged: boolean  = true;

    if (error instanceof HttpErrorResponse)
    {
      const dto: HostDTO = error.error as HostDTO;

      if (
        dto.value === undefined
        || dto.value.code === undefined
        || dto.value.code === null
      )
      {
        errorCode = CoreErrorCode.SystemServer;
      }
      else
      {
        errorCode = dto.value.code as string;
      }
    }
    else if (error instanceof BaseError)
    {
      errorCode = error.getCode();
      isAlertSpawned = error.IsAlertSpawned;
      isLogged = error.IsLogged;

      translationOptions = error.getTranslationOptions() as TranslationOptions;
    }
    else
    {
      errorCode = CoreErrorCode.SystemClient;
    }

    if (isAlertSpawned)
    {
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

    if (isLogged)
    {
      this.log.error(error);
    }
  }
}
