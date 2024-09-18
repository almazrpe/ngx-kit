import { Injectable, NgZone } from "@angular/core";
import { log } from "../log";
import { AlertService } from "../alert/alert.service";
import { AlertLevel } from "../alert/models";
import { I18nService } from "../i18n/i18n.service";
import { Err, ErrCls, ErrFromNative, Option, def } from "../../public-api";
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

    public handle(genericErr: Error): void {
        let err: Option<ErrCls> = undefined

        if (!(genericErr instanceof ErrCls)) {
            if (genericErr instanceof HttpErrorResponse) {
                let err_body = {code: undefined, msg: genericErr.error};
                try {
                    err_body = JSON.parse(genericErr.error);
                } catch (exc) {}

                if (!def(err_body)) {
                    err_body = {code: undefined, msg: genericErr.error}
                }
                let msg = err_body.msg;
                if (msg === undefined) {
                    msg = genericErr.error;
                }

                let code = `http(${genericErr.status})`;
                if (err_body.code !== undefined) {
                    code += `::${err_body.code}`;
                }

                err = Err(
                    msg,
                    code
                )
            } else {
                err = ErrFromNative(genericErr)
            }
        } else {
            err = genericErr
        }

        if (!def(err)) {
            log.err("logic err at error handler: `err` must be defined")
            return
        }

        let skipAlert = err.getExtraField("skipAlert") === true
        let skipLogging = err.getExtraField("skipLogging") === true

        if (!skipAlert) {
            this.ngZone.runTask(() => this.alertService.spawn({
                level: AlertLevel.Error,
                msg: (err as ErrCls).display()
            }))
        }
        if (!skipLogging) {
            log.track(err)
        }
    }
}
