import { Injectable } from "@angular/core";
import { Observable, ReplaySubject, Subject } from "rxjs";
import { CallEvent } from "./alert-stack.component";
import { Alert, AlertLevel } from "./models";

@Injectable({
    providedIn: "root"
})
export class AlertService {
    private alerts: Subject<Alert> = new Subject();
    public alerts$: Observable<Alert> = this.alerts.asObservable();

    private componentCall: ReplaySubject<CallEvent> =
        new ReplaySubject<CallEvent>();
    public componentCall$: Observable<CallEvent> =
        this.componentCall.asObservable();

    /**
     * Spawn a new alert
     *
     * @param alert Alert to spawn
     */
    public spawn(alert: Alert): void {
        this.alerts.next(alert);
    }

    public spawn_info(msg: string) {
        this.alerts.next({
            level: AlertLevel.Info,
            msg: msg,
        })
    }

    public spawn_warning(msg: string) {
        this.alerts.next({
            level: AlertLevel.Warning,
            msg: msg,
        })
    }

    public spawn_error(msg: string) {
        this.alerts.next({
            level: AlertLevel.Error,
            msg: msg,
        })
    }

    /**
     * Remove all alerts
     */
    public clear(): void {
        this.componentCall.next(CallEvent.CLEAR);
    }
}
