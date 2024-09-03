import { Injectable, NgZone } from "@angular/core";
import {log} from "../log";
import { AlertService } from "../alert/alert.service";
import { AlertLevel } from "../alert/models";
import {
  I18nService
} from "../i18n/i18n.service";
import { ErrCls, ErrFromNative } from "../../public-api";

@Injectable({
  providedIn: "root"
})
export class ErrorHandlerService {

  public constructor(
    private alertService: AlertService,
    private translation: I18nService,
    private ngZone: NgZone,
  ) { }

  public handle(err: Error): void {
    if (!(err instanceof ErrCls)) {
      err = ErrFromNative(err);
    }
    this.ngZone.runTask(() => this.alertService.spawn({
      level: AlertLevel.Error,
      msg: (err as ErrCls).display()
    }));
    log.track(err);
  }
}
