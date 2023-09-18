import { Component, Input, OnInit } from "@angular/core";
import { Alert, AlertLevel } from "./models";

@Component({
  selector: "minithings-alert",
  templateUrl: "./alert.component.html",
  styles: [
  ]
})
export class AlertComponent implements OnInit
{
  @Input() public alert: Alert;
  public html: {classes: string[]} = {
    classes: []
  };

  //constructor() {}

  public ngOnInit(): void
  {
    this.adjustHtmlClasses();
  }

  private adjustHtmlClasses(): void
  {
    switch (this.alert.level)
    {
      case AlertLevel.Info:
        this.html.classes = ["bg-sky-200", "text-sky-800"];
        break;
      case AlertLevel.Warning:
        this.html.classes = ["bg-yellow-200", "text-yellow-800"];
        break;
      case AlertLevel.Error:
        this.html.classes = ["bg-red-200", "text-red-800"];
        break;
      default:
        throw Error("Unrecognized alert level " + this.alert.level);
    }
  }

  public get iconPath(): string
  {
    switch (this.alert.level)
    {
      case AlertLevel.Info:
        return "assets/info.svg";
      case AlertLevel.Warning:
        return "assets/warning2.svg";
      case AlertLevel.Error:
        return "assets/error.svg";
      default:
        throw Error("Unrecognized alert level " + this.alert.level);
    }
  }
}
