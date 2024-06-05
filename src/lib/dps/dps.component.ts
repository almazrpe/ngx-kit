import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { DocumentPage } from "./document-page";
import { InputType } from "../input/input-type";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { BehaviorSubject, ReplaySubject } from "rxjs";
import { ButtonMode } from "../button/button.component";
import { DPSConfig, makeDPSConfig } from "./models";
import { Dimensions, ImageTransform } from "ngx-image-cropper";
import { log } from "../log";

enum Axis {
  Horizontal = 0,
  Vertical = 1,
  Both = 2
}
const INITIAL_CARDINAL_SPEED: number = 30;
const INITIAL_ORDINAL_SPEED: number = 20;
const CARDINAL_MULTIPLIER: number = 1.2;
const ORDINAL_MULTIPLIER: number = 1.1;
const SCALE_MULTIPLIER: number = .2;

@Component({
  selector: "ngx-kit-dps",
  templateUrl: "./dps.component.html",
  styleUrls: ["./dps-design.scss"],
})
export class DPSComponent implements OnInit
{
  @Input() public config: Partial<DPSConfig> = {};
  @Input() public pages: DocumentPage[];
  @Output() public back: EventEmitter<any> = new EventEmitter<any>();

  public currentPageNumber: number;
  public totalPagesNumber: number;
  public form: FormGroup;

  public currentPage$: ReplaySubject<DocumentPage> =
    new ReplaySubject<DocumentPage>();
  public errorMessage$: BehaviorSubject<string | null> =
    new BehaviorSubject<string | null>(null);

  public isPageupEnabled$: ReplaySubject<boolean> =
    new ReplaySubject<boolean>();
  public isPagedownEnabled$: ReplaySubject<boolean> =
    new ReplaySubject<boolean>();

  public rControllerShown: boolean = false;
  public imageShown: boolean = false;
  public imageLoading: boolean = true;
  public imageRotation: number = 0;
  public imageScale: number = 1;
  public imageTranslateV: number = 0;
  public imageTranslateH: number = 0;
  public imageTransform: ImageTransform = {
    translateUnit: "px"
  };
  private imageSpeedH: number = 0;
  private imageSpeedV: number = 0;

  public _config_: DPSConfig;
  public InputType = InputType;
  public ButtonMode = ButtonMode;

  public ngOnInit(): void
  {
    this._config_ = makeDPSConfig(this.config);
    this.currentPageNumber = 1;
    this.emitCurrentPage();
    this.totalPagesNumber = this.pages.length;

    this.form = new FormGroup({
      currentPageNumber: new FormControl(1, [
        Validators.min(1),
        Validators.max(this.totalPagesNumber),
        // Restriction for decimal fractions:
        Validators.pattern(/^[0-9]{1,}$/)
      ]),
    });

    this.togglePageNavigationButtons();
  }

  public pageup(): void
  {
    this.imageLoading = true;
    this.currentPageNumber--;
    this.form.controls["currentPageNumber"].setValue(this.currentPageNumber);
    this.emitCurrentPage();
  }

  public pagedown(): void
  {
    this.imageLoading = true;
    this.currentPageNumber++;
    this.form.controls["currentPageNumber"].setValue(this.currentPageNumber);
    this.emitCurrentPage();

  }

  public onInputValue(value: any): void
  {
    this.currentPageNumber = Number(value);
    this.emitCurrentPage();
  }

  public backInner(event: any): void
  {
    this.back.emit(event);
  }

  private emitCurrentPage(): void
  {
    const currentPage: DocumentPage = this.pages[this.currentPageNumber-1];

    if (currentPage === undefined)
    {
      this.errorMessage$.next(
        `${this._config_.noSuchDocPageTranslation} ${this.currentPageNumber}`
      );
    }
    else
    {
      this.errorMessage$.next(null);
    }

    this.togglePageNavigationButtons();

    this.currentPage$.next(currentPage);
    this.resetImage();
  }

  private togglePageNavigationButtons(): void
  {
    if (this.currentPageNumber > 1)
    {
      this.isPageupEnabled$.next(true);
    }
    else
    {
      this.isPageupEnabled$.next(false);
    }

    if (this.currentPageNumber < this.totalPagesNumber)
    {
      this.isPagedownEnabled$.next(true);
    }
    else
    {
      this.isPagedownEnabled$.next(false);
    }
  }

  public imageLoaded(): void
  {
    this.imageShown = true;
  }

  public cropperReady(sourceImageDimensions: Dimensions): void
  {
    this.imageLoading = false;
  }

  public loadImageFailed(): void
  {
    log.err("load image failed in DPS component");
  }

  public toggleRController(): void
  {
    this.rControllerShown = !this.rControllerShown;
  }

  public resetImage(): void
  {
    this.imageSpeedH = 0;
    this.imageSpeedV = 0;
    this.imageTranslateH = 0;
    this.imageTranslateV = 0;
    this.imageScale = 1;
    this.imageRotation = 0;
    this.imageTransform = {
      translateUnit: "px"
    };
  }

  public rotateImage(sgn: number): void
  {
    this.imageLoading = true;
    // Use timeout because rotating image is a heavy operation and
    // will block the ui thread
    setTimeout(() => 
{
      this.imageRotation += Math.sign(sgn);
      this.flipImageAfterRotate();
    });
  }

  private flipImageAfterRotate(): void
  {
    const flippedH = this.imageTransform.flipH;
    const flippedV = this.imageTransform.flipV;
    this.imageTransform = {
      ...this.imageTransform,
      flipH: flippedV,
      flipV: flippedH
    };
    this.imageSpeedH = 0;
    this.imageSpeedV = 0;
    this.imageTranslateH = 0;
    this.imageTranslateV = 0;
  }

  public zoomImage(sgn: number): void
  {
    this.imageSpeedH = 0;
    this.imageSpeedV = 0;
    this.imageScale += SCALE_MULTIPLIER * Math.sign(sgn);
    this.imageTransform = {
      ...this.imageTransform,
      scale: this.imageScale
    };
  }

  public moveImageW(): void
  {
    if (this.imageSpeedH > 0)
      this.imageSpeedH = this.imageSpeedH * CARDINAL_MULTIPLIER;
    else
      this.imageSpeedH = INITIAL_CARDINAL_SPEED;

    this.refreshImageTranslate(Axis.Horizontal);
  }

  public moveImageE(): void
  {
    if (this.imageSpeedH < 0)
      this.imageSpeedH = this.imageSpeedH * CARDINAL_MULTIPLIER;
    else
      this.imageSpeedH = -INITIAL_CARDINAL_SPEED;

    this.refreshImageTranslate(Axis.Horizontal);
  }

  public moveImageN(): void
  {
    if (this.imageSpeedV > 0)
      this.imageSpeedV = this.imageSpeedV * CARDINAL_MULTIPLIER;
    else
      this.imageSpeedV = INITIAL_CARDINAL_SPEED;

    this.refreshImageTranslate(Axis.Vertical);
  }

  public moveImageS(): void
  {
    if (this.imageSpeedV < 0)
      this.imageSpeedV = this.imageSpeedV * CARDINAL_MULTIPLIER;
    else
      this.imageSpeedV = -INITIAL_CARDINAL_SPEED;

    this.refreshImageTranslate(Axis.Vertical);
  }

  public moveImageNW(): void
  {
    if (this.imageSpeedV > 0)
      this.imageSpeedV = this.imageSpeedV * ORDINAL_MULTIPLIER;
    else
      this.imageSpeedV = INITIAL_ORDINAL_SPEED;

    if (this.imageSpeedH > 0)
      this.imageSpeedH = this.imageSpeedH * ORDINAL_MULTIPLIER;
    else
      this.imageSpeedH = INITIAL_ORDINAL_SPEED;

    this.refreshImageTranslate(Axis.Both);
  }

  public moveImageNE(): void
  {
    if (this.imageSpeedV > 0)
      this.imageSpeedV = this.imageSpeedV * ORDINAL_MULTIPLIER;
    else
      this.imageSpeedV = INITIAL_ORDINAL_SPEED;

    if (this.imageSpeedH < 0)
      this.imageSpeedH = this.imageSpeedH * ORDINAL_MULTIPLIER;
    else
      this.imageSpeedH = -INITIAL_ORDINAL_SPEED;

    this.refreshImageTranslate(Axis.Both);
  }

  public moveImageSW(): void
  {
    if (this.imageSpeedV < 0)
      this.imageSpeedV = this.imageSpeedV * ORDINAL_MULTIPLIER;
    else
      this.imageSpeedV = -INITIAL_ORDINAL_SPEED;

    if (this.imageSpeedH > 0)
      this.imageSpeedH = this.imageSpeedH * ORDINAL_MULTIPLIER;
    else
      this.imageSpeedH = INITIAL_ORDINAL_SPEED;

    this.refreshImageTranslate(Axis.Both);
  }

  public moveImageSE(): void
  {
    if (this.imageSpeedV < 0)
      this.imageSpeedV = this.imageSpeedV * ORDINAL_MULTIPLIER;
    else
      this.imageSpeedV = -INITIAL_ORDINAL_SPEED;

    if (this.imageSpeedH < 0)
      this.imageSpeedH = this.imageSpeedH * ORDINAL_MULTIPLIER;
    else
      this.imageSpeedH = -INITIAL_ORDINAL_SPEED;

    this.refreshImageTranslate(Axis.Both);
  }

  private refreshImageTranslate(axis: Axis): void
  {
    switch(axis)
    {
      case Axis.Horizontal:
        this.imageTranslateH += this.imageSpeedH;
        this.imageTransform = {
          ...this.imageTransform,
          translateH: this.imageTranslateH
        };
        break;
      case Axis.Vertical:
        this.imageTranslateV += this.imageSpeedV;
        this.imageTransform = {
          ...this.imageTransform,
          translateV: this.imageTranslateV
        };
        break;
      default:
        this.imageTranslateH += this.imageSpeedH;
        this.imageTranslateV += this.imageSpeedV;
        this.imageTransform = {
          ...this.imageTransform,
          translateH: this.imageTranslateH,
          translateV: this.imageTranslateV
        };
        break;
    }
  }
}
