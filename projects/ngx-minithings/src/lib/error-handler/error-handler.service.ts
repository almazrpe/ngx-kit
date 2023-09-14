import { HttpErrorResponse } from "@angular/common/http";
import { Injectable, NgZone } from "@angular/core";
import { AlertService } from "src/app/utils/alert/alert.service";
import { HostDTO } from "src/app/utils/dto";
import { LogService } from "src/app/utils/log/log.service";
import { TranslationService }
  from "src/app/utils/translation/translation.service";
import { BaseError } from "../../utils/errors";
import { ErrorCode } from "../REDACTED/codes";
import { AlertLevel } from "src/app/utils/alert/alert";
import { TranslationOptions } from "src/app/utils/translation/options";

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
        errorCode = ErrorCode.SYSTEM_SERVER;
      }
      else
      {
        errorCode = dto.value.code as string;
      }
    }
    else if (error instanceof BaseError)
    {
      errorCode = error.getCode();
      isAlertSpawned = error.IS_ALERT_SPAWNED;
      isLogged = error.IS_LOGGED;

      translationOptions = error.getTranslationOptions();
    }
    else
    {
      errorCode = ErrorCode.SYSTEM_CLIENT;
    }

    if (isAlertSpawned)
    {
      this.translation.get(
        errorCode,
        translationOptions
      ).subscribe((res: string) =>
      {
        this.ngZone.runTask(() => this.alertService.spawn({
          level: AlertLevel.ERROR,
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
