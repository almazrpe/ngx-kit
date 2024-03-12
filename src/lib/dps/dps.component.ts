import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { DocumentPage } from "./document-page";
import { InputType } from "../input/input-type";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { BehaviorSubject, ReplaySubject } from "rxjs";
import { ButtonMode } from "../button/button.component";
import { DPSConfig, makeDPSConfig } from "./models";

@Component({
  selector: "ngx-kit-dps",
  templateUrl: "./dps.component.html",
  styleUrls: [],
})
export class DPSComponent implements OnInit
{
  public InputType = InputType;
  public ButtonMode = ButtonMode;
  public _config_: DPSConfig;

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

  //public constructor() {}

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
    this.currentPageNumber--;
    this.form.controls["currentPageNumber"].setValue(this.currentPageNumber);
    this.emitCurrentPage();
  }

  public pagedown(): void
  {
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
}
