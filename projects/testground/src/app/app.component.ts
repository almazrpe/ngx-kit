import { Component, OnInit } from "@angular/core";
import { TypeExpectError, UnsupportedError } from "@slimebones/ngx-antievil";
import { AlertService } from "ngx-minithings/alert/alert.service";
import { AlertLevel } from "ngx-minithings/alert/models";
import { AlertUtils } from "ngx-minithings/alert/utils";
import { DatalistOption } from "ngx-minithings/datalist/datalist-option";
import { InputType } from "ngx-minithings/input/input-type";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html"
})
export class AppComponent implements OnInit
{
  public InputType = InputType;
  public readonly AlertLevel = AlertLevel;
  public levelOptions: DatalistOption<AlertLevel>[];

  public level: AlertLevel;
  public message: string;
  public livingTime: number = 5;

  public constructor(
    private alertService: AlertService
  ) {}

  public ngOnInit(): void
  {
    this.levelOptions = [];
    for (const level in AlertLevel)
    {
      if (isNaN(Number(level)))
      {
        this.levelOptions.push({
          value: level as string
        });
      }
    }
  }

  public spawnAlert(level: AlertLevel, message: string): void
  {
    this.alertService.spawn({
      level: level,
      message: message
    });
  }

  public onInputValue(
    type: string,
    value: string | number | DatalistOption<AlertLevel>
  ): void
  {
    console.log(value);

    switch (type)
    {
      case "level":
        if (!AlertUtils.isAlertLevel(value))
        {
          throw new TypeExpectError(
            {"title": "value"}, "AlertLevel", typeof value
          );
        }
        this.level = value;
        break;
      case "message":
        if (typeof value !== "string")
        {
          throw new TypeExpectError(
            {"title": "value"}, "string", typeof value
          );
        }
        this.message = value;
        break;
      case "livingTime":
        if (typeof value !== "number")
        {
          throw new TypeExpectError(
            {"title": "value"}, "number", typeof value
          );
        }
        this.livingTime = value;
        break;
      default:
        throw new UnsupportedError("input type", type);
    }
  }
}
