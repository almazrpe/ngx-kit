import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { InputType } from "../input/input-type";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { BehaviorSubject, ReplaySubject } from "rxjs";
import { ButtonMode } from "../button/button.component";
import { PdfViewerConfig, makePdfViewerConfig } from "./models";

@Component({
    selector: "ngx-kit-pdf-viewer",
    templateUrl: "./pdf-viewer.component.html",
    styleUrls: []
})
export class PdfViewerComponent implements OnInit {
    public InputType = InputType;
    public ButtonMode = ButtonMode;
    public Math = Math;
    public _config_: PdfViewerConfig;

    @Input() public config: Partial<PdfViewerConfig> = {};

    @Input() public url: string;
    @Input() public pagesCount: number;

    @Output() public back: EventEmitter<any> = new EventEmitter<any>();

    public form: FormGroup;

    public currentPageNumber$: BehaviorSubject<number> =
        new BehaviorSubject<number>(1);
    public zoom$: BehaviorSubject<number> =
        new BehaviorSubject<number>(1);
    public errorMessage$: BehaviorSubject<string | null> =
        new BehaviorSubject<string | null>(null);

    public isPageupEnabled$: ReplaySubject<boolean> =
        new ReplaySubject<boolean>();
    public isPagedownEnabled$: ReplaySubject<boolean> =
        new ReplaySubject<boolean>();
    public isZoomupEnabled$: ReplaySubject<boolean> =
        new ReplaySubject<boolean>();
    public isZoomdownEnabled$: ReplaySubject<boolean> =
        new ReplaySubject<boolean>();

    public ngOnInit(): void {
        this._config_ = makePdfViewerConfig(this.config);
        if (this._config_.pdfWorkerPath != null)
            (window as any).pdfWorkerSrc = this._config_.pdfWorkerPath;
        this.emitCurrentPage();

        this.form = new FormGroup({
            currentPageNumber: new FormControl(1, [
                Validators.min(1),
                Validators.max(this.pagesCount),
                // Restriction for decimal fractions:
                Validators.pattern(/^[0-9]{1,}$/)
            ]),
        });

        this.togglePageNavigationButtons();
        this.toggleZoomButtons();
    }

    public pageup(): void {
        this.currentPageNumber$.next(this.currentPageNumber$.value - 1);
        this.form.controls["currentPageNumber"].setValue(
            this.currentPageNumber$.value
        );
        this.emitCurrentPage();
    }

    public pagedown(): void {
        this.currentPageNumber$.next(this.currentPageNumber$.value + 1);
        this.form.controls["currentPageNumber"].setValue(
            this.currentPageNumber$.value
        );
        this.emitCurrentPage();
    }

    public zoomup(): void {
        this.zoom$.next(this.zoom$.value + 0.1);
        this.toggleZoomButtons();
    }

    public zoomdown(): void {
        this.zoom$.next(this.zoom$.value - 0.1);
        this.toggleZoomButtons();
    }

    public onInputValue(value: any): void {
        this.currentPageNumber$.next(Number(value));
        this.emitCurrentPage();
    }

    public backInner(event: any): void {
        this.back.emit(event);
    }

    private emitCurrentPage(): void {
        if (
            this.currentPageNumber$.value < 1
            || this.currentPageNumber$.value > this.pagesCount
        ) {
            this.errorMessage$.next(
                `${this._config_.noSuchDocPageTranslation} ` +
                `${this.currentPageNumber$.value}`
            );
        } else {
            this.errorMessage$.next(null);
        }

        this.togglePageNavigationButtons();
    }

    private togglePageNavigationButtons(): void {
        if (this.currentPageNumber$.value > 1) {
            this.isPageupEnabled$.next(true);
        } else {
            this.isPageupEnabled$.next(false);
        }

        if (this.currentPageNumber$.value < this.pagesCount) {
            this.isPagedownEnabled$.next(true);
        } else {
            this.isPagedownEnabled$.next(false);
        }
    }

    private toggleZoomButtons(): void {
        if (3 - this.zoom$.value > 1e-5) {
            this.isZoomupEnabled$.next(true);
        } else {
            this.isZoomupEnabled$.next(false);
        }

        if (this.zoom$.value - 0.1 > 1e-5) {
            this.isZoomdownEnabled$.next(true);
        } else {
            this.isZoomdownEnabled$.next(false);
        }
    }
}
