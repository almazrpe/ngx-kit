import { Component, Input } from "@angular/core";
import { ObjectStatusSize, ObjectStatusData } from "./model";

@Component({
    selector: "ngx-kit-object-status",
    templateUrl: "./object-status.component.html",
    styleUrls: []
})
export class ObjectStatusComponent {
    @Input() public statusData: ObjectStatusData;
    @Input() public size: ObjectStatusSize = ObjectStatusSize.Normal;

    public ObjectStatusSize: any = ObjectStatusSize;

    //public constructor() {}
}
