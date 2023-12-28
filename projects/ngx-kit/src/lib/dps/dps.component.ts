import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { DocumentPage } from "./document-page";
import { InputType } from "../input/input-type";
import { FormControl, FormGroup } from "@angular/forms";
import { BehaviorSubject, ReplaySubject } from "rxjs";
import { I18nService } from "../i18n/i18n.service";
import { ButtonMode } from "../button/button.component";
import Codes from "ngx-kit/_auto_codes";

@Component({
  selector: "ngx-kit-dps",
  templateUrl: "./dps.component.html",
  styleUrls: [],
})
export class DPSComponent implements OnInit
{
  public InputType = InputType;
  public ButtonMode = ButtonMode;

  @Input() public pages: DocumentPage[];

  @Output() public back: EventEmitter<any> = new EventEmitter<any>();

  public currentPageNumber: number;
  public totalPagesNumber: number;
  public inputType: InputType = InputType.Number;
  public form: FormGroup;

  public currentPage$: ReplaySubject<DocumentPage> =
    new ReplaySubject<DocumentPage>();
  public errorMessage$: BehaviorSubject<string | null> =
    new BehaviorSubject<string | null>(null);
  public pageNumberTranslation: string;

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
    private i18n: I18nService
  ) {}

  public ngOnInit(): void
  {
    this.currentPageNumber = 1;
    this.emitCurrentPage();
    this.totalPagesNumber = this.pages.length;

    this.form = new FormGroup({
      currentPageNumber: new FormControl(1)
    });

    this.pageNumberTranslation = this.i18n.getTranslation(
      Codes.almaz.ngx_kit.dps.translation.page_number,
      {
        fallback: "Page number"
      }
    );

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
      this.errorMessage$.next(this.i18n.getTranslation(
        Codes.almaz.ngx_kit.dps.translation.no_such_document_page,
        {
          params: {
            number: this.currentPageNumber
          },
          fallback: "no such document page ${number}"
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
