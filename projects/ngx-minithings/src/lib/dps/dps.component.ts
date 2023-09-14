import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { DocumentPage } from "./documentpage";
import { InputType } from "../input/input-type";
import { FormControl, FormGroup } from "@angular/forms";
import { BehaviorSubject, Observable, ReplaySubject } from "rxjs";
import { TranslationService } from "../translation/translation.service";
import { UICode } from "src/app/helpers/codes";
import { ButtonMode } from "../btn/btn.component";

@Component({
  selector: "dps",
  templateUrl: "./dps.component.html",
  styles: [
  ]
})
export class DPSComponent implements OnInit
{
  public InputType = InputType;
  public ButtonMode = ButtonMode;

  @Input() public pages: DocumentPage[];

  @Output() public back: EventEmitter<any> = new EventEmitter<any>();

  public currentPageNumber: number;
  public totalPagesNumber: number;
  public inputType: InputType = InputType.NUMBER;
  public form: FormGroup;

  public currentPage$: ReplaySubject<DocumentPage> =
    new ReplaySubject<DocumentPage>();
  public errorMessage$: BehaviorSubject<Observable<string> | null> =
    new BehaviorSubject<Observable<string> | null>(null);
  public pageNumberTranslation$: Observable<string>;

  public isPageupEnabled$: ReplaySubject<boolean> =
    new ReplaySubject<boolean>();
  public isPagedownEnabled$: ReplaySubject<boolean> =
    new ReplaySubject<boolean>();

  public pageNumberSelectorCSSClasses: string[] = [
    // Remove arrows from number inputs (see input.class)
    // https://stackoverflow.com/a/75872055
    "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none"
    + " [&::-webkit-inner-spin-button]:appearance-none",
    "w-full",
    "h-full",
    "text-center",
    "rounded"
  ];

  public constructor(
    private translation: TranslationService
  ) {}

  public ngOnInit(): void
  {
    this.currentPageNumber = 1;
    this.emitCurrentPage();
    this.totalPagesNumber = this.pages.length;

    this.form = new FormGroup({
      currentPageNumber: new FormControl(1)
    });

    this.pageNumberTranslation$ = this.translation.get(
      UICode.DOCUMENT_PAGE_NUMBER
    );

    this.togglePageNavigationButtons();
  }

  public pageup(): void
  {
    this.currentPageNumber--;
    this.form.controls.currentPageNumber.setValue(this.currentPageNumber);
    this.emitCurrentPage();
  }

  public pagedown(): void
  {
    this.currentPageNumber++;
    this.form.controls.currentPageNumber.setValue(this.currentPageNumber);
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
      this.errorMessage$.next(this.translation.get(
        UICode.NO_SUCH_DOCUMENT_PAGE,
        {
          params: {
            number: this.currentPageNumber
          }
        }
      ));
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
