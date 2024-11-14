import { 
    Component, 
    EventEmitter, 
    Input, 
    OnInit, 
    Output
} from "@angular/core";
import { ExtendedPinchZoomTransform } from "ngx-kit/pdf-viewer/model";
import { PinchZoomTransform } from "ngx-kit/pinch-zoom/model";
import { BehaviorSubject } from "rxjs";
import { ImgViewerConfig, makeImgViewerConfig } from "./model";

@Component({
    selector: "ngx-kit-img-viewer",
    templateUrl: "./img-viewer.component.html",
    styleUrls: []
})
export class ImgViewerComponent implements OnInit {
    @Input() public url: string;
    @Input() public config: Partial<ImgViewerConfig> = {};
    @Input() public usePinchZoom: boolean = true;
    @Input() public initialTransform?: 
        PinchZoomTransform 
        | ExtendedPinchZoomTransform;
    @Output() public back: EventEmitter<any> = new EventEmitter<any>();
    @Output() public newTransform: EventEmitter<any> = new EventEmitter<any>();
    public _config_: ImgViewerConfig;
    public transform$: BehaviorSubject<PinchZoomTransform | undefined> = 
        new BehaviorSubject<PinchZoomTransform | undefined>(undefined);

    public ngOnInit(): void {
        this._config_ = makeImgViewerConfig(this.config);
        this.transform$.next(
            (
                this.initialTransform ?? {
                    scale: 1,
                    moveX: 0,
                    moveY: 0
                }
            ) as PinchZoomTransform
        );
    }

    public sendTransform(newTransform: PinchZoomTransform): void {
        if (
            this.transform$.value === undefined
            || newTransform.scale !== this.transform$.value.scale 
            || newTransform.moveX !== this.transform$.value.moveX
            || newTransform.moveY !== this.transform$.value.moveY
        ) {
            this.transform$.next(newTransform);
            this.newTransform.emit(this.transform$.value);
        }
    }

    public backInner(): void {
        this.back.emit();
    }
}
