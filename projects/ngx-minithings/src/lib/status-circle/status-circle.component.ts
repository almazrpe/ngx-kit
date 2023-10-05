import { Component, Input } from "@angular/core";

export enum StatusCircleMode {
  ACTIVE = 0,
  NONACTIVE = 1
}

@Component({
  selector: "ngx-minithings-status-circle",
  templateUrl: "./status-circle.component.html",
  styleUrls: [],
})
export class StatusCircleComponent
{
  @Input() public mode: StatusCircleMode = StatusCircleMode.ACTIVE;

  public CircleMode: any = StatusCircleMode;
}
