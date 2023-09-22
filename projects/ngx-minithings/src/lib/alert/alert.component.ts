import { Component, Input, OnInit } from "@angular/core";
import { Alert, AlertLevel } from "./models";

@Component({
  selector: "ngx-minithings-alert",
  templateUrl: "./alert.component.html",
  styleUrls: []
})
export class AlertComponent implements OnInit
{
  @Input() public alert: Alert;
  @Input() public iconURL: string;

  public rootCSSClasses: string[];

  public ngOnInit(): void
  {
    this.adjustHtmlClasses();
  }

  private adjustHtmlClasses(): void
  {
    switch (this.alert.level)
    {
      case AlertLevel.Info:
        this.rootCSSClasses = ["bg-sky-200", "text-sky-800"];
        break;
      case AlertLevel.Warning:
        this.rootCSSClasses = ["bg-yellow-200", "text-yellow-800"];
        break;
      case AlertLevel.Error:
        this.rootCSSClasses = ["bg-red-200", "text-red-800"];
        break;
      default:
        throw Error("Unrecognized alert level " + this.alert.level);
    }
  }
}
