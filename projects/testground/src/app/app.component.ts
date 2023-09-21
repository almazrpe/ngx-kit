import { Component, OnInit } from "@angular/core";
import { AlertService } from "ngx-minithings/alert/alert.service";
import { AlertLevel } from "ngx-minithings/alert/models";
import { InputType } from "ngx-minithings/input/input-type";
AnalyserNode;
@Component({
  selector: "app-root",
  templateUrl: "./app.component.html"
})
export class AppComponent implements OnInit
{
  public InputType = InputType;
  public readonly AlertLevel = AlertLevel;

  public constructor(
    private alertService: AlertService
  ) {}

  public ngOnInit(): void
  {
    return;
  }

  public spawnAlert(level: AlertLevel, message: string): void
  {
    this.alertService.spawn({
      level: level,
      message: message
    });
  }
}
