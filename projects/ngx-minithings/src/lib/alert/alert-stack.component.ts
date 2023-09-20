import { Component, Input, OnInit } from "@angular/core";
import {Alert, AlertLevel, AlertUrls} from "./models";
import { AlertService } from "./alert.service";
import {Queue} from "queue-typescript";
import { QueueUtils } from "ngx-minithings/queue";

export enum CallEvent {
  CLEAR = 0
}

@Component({
  selector: "ngx-minithings-alert-stack",
  templateUrl: "./alert-stack.component.html",
  styleUrls: ["../tailwind.css"]
})
export class AlertStackComponent implements OnInit
{
  @Input() private urls: AlertUrls = {
    info: "assets/ngx-minithings/info.svg",
    warning: "assets/ngx-minithings/warning.svg",
    error: "assets/ngx-minithings/error.svg",
  };

  public readonly ALERT_LIVING_TIME: number = 5;
  public readonly MAX_QUEUE_LEN: number = 3;
  public alertQueue: Queue<Alert> = new Queue();

  private clearingTimer: NodeJS.Timeout;
  private isClearingTimerActive = false;

  public constructor(
    private alertService: AlertService
  ) {}

  public ngOnInit(): void
  {
    this.alertService.alerts$.subscribe({
      next: (alert: Alert) =>
      {
        this.add(alert);
      },
      error: (err: Error) =>
      {
        throw err;
      }
    });

    this.alertService.componentCall$.subscribe({
      next: event => this.call(event),
      error: err => {throw err;}
    });
  }

  private call(event: CallEvent): void
  {
    switch (event)
    {
      case CallEvent.CLEAR:
        this.clear();
        break;
      default:
        throw Error("Unrecognized call event code " + event);
    }
  }

  // Clear all alerts
  private clear(): void
  {
    QueueUtils.clearQueue<Alert>(this.alertQueue);
    this.disableClearingTimer();
  }

  private add(alert: Alert): void
  {
    if (this.alertQueue.length + 1 > this.MAX_QUEUE_LEN)
    {
      // Dequeue oldest element instantly
      this.alertQueue.dequeue();
    }

    this.alertQueue.append(alert);
    // Setup new clearing timer for each added alert
    this.startClearingTimer();
  }

  /**
   * Update clearing timer to delete oldest first added alert.
   *
   * Only one timer should be active at a time to avoid concurrency.
   */
  private startClearingTimer(): void
  {
    if (!this.isClearingTimerActive)
    {
      this.isClearingTimerActive = true;
      this.clearingTimer = setTimeout(
        this.removeOldestByTimer.bind(this), this.ALERT_LIVING_TIME * 1000
      );
    }
  }

  // Immediatelly manually disable clearing timer
  private disableClearingTimer(): void
  {
    clearTimeout(this.clearingTimer);
    this.isClearingTimerActive = false;
  }

  private removeOldestByTimer(): void
  {
    this.alertQueue.dequeue();
    this.isClearingTimerActive = false;

    if (this.alertQueue.length > 0)
    {
      // Start new cleans recursively until all items are gone
      this.startClearingTimer();
    }
  }

  public getAlertIconURL(alert: Alert): string
  {
    switch (alert.level)
    {
      case AlertLevel.Info:
        return this.urls.info;
      case AlertLevel.Warning:
        return this.urls.warning;
      case AlertLevel.Error:
        return this.urls.error;
      default:
        throw Error("Unrecognized alert level " + alert.level);
    }
  }
}
