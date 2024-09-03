import { Injectable } from "@angular/core";
import { Observable, ReplaySubject, Subject } from "rxjs";
import { CallEvent } from "./alert-stack.component";
import { Alert } from "./models";

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

  /**
   * Remove all alerts
   */
  public clear(): void {
    this.componentCall.next(CallEvent.CLEAR);
  }
}
