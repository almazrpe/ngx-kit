import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { PinchZoomTransform } from "ngx-kit/pinch-zoom/model";
import { 
    PdfViewerConfig, 
    makePdfViewerConfig, 
    ExtendedPinchZoomTransform 
} from "./model";

@Component({
    selector: "ngx-kit-pdf-viewer",
    templateUrl: "./pdf-viewer.component.html",
    styleUrls: ["./design.scss"]
})
export class PdfViewerComponent implements OnInit {
    @Input() public url: string;
    @Input() public config: Partial<PdfViewerConfig> = {};
    @Input() public initialTransform?: ExtendedPinchZoomTransform;
    @Output() public back: EventEmitter<any> = new EventEmitter<any>();
    @Output() public newTransform: EventEmitter<any> = new EventEmitter<any>();
    public zoom$: BehaviorSubject<number> =
        new BehaviorSubject<number>(1);
    public _config_: PdfViewerConfig;
    public transform$: 
        BehaviorSubject<ExtendedPinchZoomTransform | undefined> =
            new BehaviorSubject<ExtendedPinchZoomTransform | undefined>(
                undefined
            );

    public ngOnInit(): void {
        this._config_ = makePdfViewerConfig(this.config);
        if (this._config_.pdfWorkerPath != null) {
            (window as any).pdfWorkerSrc = this._config_.pdfWorkerPath;
        }
        this.transform$.next(
            this.initialTransform ?? {
                scale: 1,
                moveX: 0,
                moveY: 0,
                scrollY: 0
            } as ExtendedPinchZoomTransform
        );
    }

    public sendTransform(newTransform: PinchZoomTransform): void {
        if (
            this.transform$.value === undefined
            || newTransform.scale !== this.transform$.value.scale 
            || newTransform.moveX !== this.transform$.value.moveX
            || newTransform.moveY !== this.transform$.value.moveY
        ) {
            this.transform$.next({
                ...newTransform,
                scrollY: this.transform$.value?.scrollY ?? 0
            })
            this.newTransform.emit(this.transform$.value);
        }
    }

    public setZoom(zoom: number): void {
        this.zoom$.next(zoom);
    }

    public backInner(): void {
        this.back.emit();
    }
}
