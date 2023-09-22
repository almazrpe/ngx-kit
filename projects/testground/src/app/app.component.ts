import { Component, OnInit } from "@angular/core";
import {
  LogicError, TypeExpectError, UnsupportedError
} from "@slimebones/ngx-antievil";
import { AlertService } from "ngx-minithings/alert/alert.service";
import { AlertLevel } from "ngx-minithings/alert/models";
import { AlertUtils } from "ngx-minithings/alert/utils";
import { DatalistOption } from "ngx-minithings/datalist/datalist-option";
import { DatalistUtils } from "ngx-minithings/datalist/utils";
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

    // since we know enum iteration goes over keys first, we can safely store
    // their indexes as their actual values
    // for example for AlertLevel the array would be:
    // ["Info", "Warning", "Error", 0, 1, 2]
    Object.values(AlertLevel).forEach((
      level: string | number, index: number
    ) =>
    {
      if (isNaN(Number(level)))
      {
        this.levelOptions.push({
          value: level as string,
          obj: index
        });
      }
    });
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
    const numValue: number = Number(value);

    switch (type)
    {
      case "level":
        if (!DatalistUtils.isDatalistOption(value))
        {
          throw new TypeExpectError(
            {"title": "value"}, "DatalistOption", typeof value
          );
        }
        if (!AlertUtils.isAlertLevel(value.value))
        {
          throw new TypeExpectError(
            {"title": "value"}, "AlertLevel", typeof value
          );
        }
        if (value.obj === undefined)
        {
          throw new LogicError(
            "datalist option's obj field should be defined for the AlertLevel"
          );
        }
        this.level = value.obj;
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
        if (isNaN(numValue))
        {
          throw new TypeExpectError(
            {"title": "value"}, "number", typeof value
          );
        }
        this.livingTime = numValue;
        break;
      default:
        throw new UnsupportedError("input type", type);
    }
  }
}
