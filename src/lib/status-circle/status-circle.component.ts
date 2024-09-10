import { Component, OnInit, Input } from "@angular/core";
import { ReplaySubject } from "rxjs";

export enum StatusCircleMode {
    ACTIVE = 0,
    NONACTIVE = 1,
    IMAGE = 2
}

@Component({
    selector: "ngx-kit-status-circle",
    templateUrl: "./status-circle.component.html",
    styleUrls: [],
})
export class StatusCircleComponent implements OnInit {
    @Input() public mode: StatusCircleMode = StatusCircleMode.ACTIVE;
    @Input() public imgSrc: string = "";
    @Input() public inputCssClasses: string[] | null = null;

    public CircleMode: any = StatusCircleMode;

    public cssClasses$: ReplaySubject<string[]> =
        new ReplaySubject<string[]>();

    public ngOnInit(): void {
        this.cssClasses$.next(this.inputCssClasses ?? ["w-4", "h-4"]);
    }
}
