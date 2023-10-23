import { Component, Input } from "@angular/core";

export enum StatusCircleMode {
  ACTIVE = 0,
  NONACTIVE = 1,
  IMAGE = 2
}

@Component({
  selector: "ngx-minithings-status-circle",
  templateUrl: "./status-circle.component.html",
  styleUrls: [],
})
export class StatusCircleComponent
{
  @Input() public mode: StatusCircleMode = StatusCircleMode.ACTIVE;
  @Input() public imgSrc: string = "";

  public CircleMode: any = StatusCircleMode;
}
