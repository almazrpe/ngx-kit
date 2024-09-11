import { Injectable, NgZone } from "@angular/core";
import { log } from "../log";
import { AlertService } from "../alert/alert.service";
import { AlertLevel } from "../alert/models";
import { I18nService } from "../i18n/i18n.service";
import { Err, ErrCls, ErrFromNative } from "../../public-api";
import { HttpErrorResponse } from "@angular/common/http";

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
            if (err instanceof HttpErrorResponse) {
                let err_body = {code: undefined, msg: err.error};
                try {
                    err_body = JSON.parse(err.error);
                } catch (exc) {}

                let msg = err_body.msg;
                if (msg === undefined) {
                    msg = err.error;
                }

                let code = `http(${err.status})`;
                if (err_body.code !== undefined) {
                    code += `::${err_body.code}`;
                }

                err = Err(
                    msg,
                    code
                );
            } else {
                err = ErrFromNative(err);
            }
        }
        this.ngZone.runTask(() => this.alertService.spawn({
            level: AlertLevel.Error,
            msg: (err as ErrCls).display()
        }));
        log.track(err);
    }
}
