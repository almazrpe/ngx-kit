import {
    AfterViewInit,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnInit,
    Output,
    ViewChild
} from "@angular/core";
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
export class PdfViewerComponent implements OnInit, AfterViewInit {
    @Input() public url: string;
    @Input() public config: Partial<PdfViewerConfig> = {};
    @Input() public initialTransform?: ExtendedPinchZoomTransform;
    @Output() public back: EventEmitter<any> = new EventEmitter<any>();
    @Output() public newTransform: EventEmitter<any> = new EventEmitter<any>();
    @ViewChild("viewerElem", { read: ElementRef })
    public viewerElem: ElementRef;
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

    public ngAfterViewInit(): void {
        this.setupPdfScroll(this.transform$.value?.scrollY ?? 0);
    }

    public setupPdfScroll(scrollY: number): void {
        const scroller: Element | null =
            this.viewerElem.nativeElement.firstElementChild;
        if (
            scroller !== null
            && scroller.scrollHeight - scroller.clientHeight !== 0
        ) {
            scroller.scroll(
                0,
                scrollY === 0
                    ? scrollY
                    : scroller.scrollHeight / scrollY
            );
            scroller.addEventListener("scroll", (event: Event) => {
                const transform: ExtendedPinchZoomTransform | undefined =
                    this.transform$.value
                if (transform !== undefined) {
                    transform.scrollY =
                        scroller.scrollHeight
                            / (event.target as Element).scrollTop
                    this.transform$.next(transform);
                    this.newTransform.emit(this.transform$.value);
                }
            })
        } else {
            setTimeout(() => {
                this.setupPdfScroll(scrollY)
            }, 250)
        }
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
