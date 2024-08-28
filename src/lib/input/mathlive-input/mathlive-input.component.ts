import {
  Component,
  ViewChild,
  ElementRef,
  OnInit,
  OnDestroy,
  AfterViewInit,
  EventEmitter,
  Input,
  Output,
  Optional,
  Self
} from "@angular/core";
import {
  ControlValueAccessor,
  NgControl,
  NgForm,
  FormGroupDirective
} from "@angular/forms";
import { Observable, of, Subscription, BehaviorSubject } from "rxjs";
import { MathfieldElement } from "mathlive";
import {
  InputValidationErrorCode,
  getDefaultErrorMessage
} from "../error-content";
import { getShadowRootExtraStyles } from "./shadow-root-design";
import {
  MathliveInputConfig,
  makeMathliveInputConfig,
  MathliveOutputFormat,
  MathliveVKLayout,
  mathliveDefaultVKLayout,
  MathliveVKName
} from "./models";

@Component({
  selector: "ngx-kit-mathlive-input",
  templateUrl: "./mathlive-input.component.html",
  styleUrls: ["./mathlive-design.scss"]
})
export class MathliveInputComponent
implements AfterViewInit, OnInit, OnDestroy, ControlValueAccessor
{
  /**
   * Configuration object (or just some part of it) for the component
   */
  @Input() public config: Partial<MathliveInputConfig> = {};
  /**
   * Array of layouts for mathlive virtual keyboard
   * The keyboard refreshes on FOCUSIN event
   * so make sure it will be BLUR between changes
   */
  @Input() public virtualKeyboardLayouts:
    Array<MathliveVKLayout | MathliveVKName> | undefined = undefined;
  /**
   * Object that allows you to add any latex string at the current
   * caret position in the input field
   */
  @Input() public addLatexEvent: Observable<string | null> = of(null);
  /**
   * Custom messages for validation errors.
   * Will be used instead of default messages if defined.
   */
  @Input() public customErrorMessages:
    Map<InputValidationErrorCode, string> | undefined = undefined;

  /**
   * Emits an event whenever the value changes.
   * The event will contain an array of strings, and
   * every string is a representation of current value in the input field
   * using some mathlive output format.
   * The field 'outputFormats' in the configuration object defines
   * which formats are needed
   */
  @Output() public inputValue: EventEmitter<any> = new EventEmitter<any>();
  /**
   * Emits an event whenever the component becomes focused.
   */
  @Output() public focus: EventEmitter<any> = new EventEmitter<any>();
  /**
   * Emits an event whenever the component becomes blured.
   * For some reason this event always triggers twice.
   */
  @Output() public blur: EventEmitter<any> = new EventEmitter<any>();
  /**
   * Emits an event whenever user presses ENTER, RETURN or
   * just leave the input field
   */
  @Output() public complete: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild("main", { static: true })
  public mainElementRef: ElementRef<HTMLDivElement>;
  public mathfield: MathfieldElement;
  public _config_: MathliveInputConfig;
  private addLatexEventSubscription: Subscription;
  /* eslint-disable */
  public onChange: (value: any) => void = (_: any) => {};
  public onTouched: () => void = () => {};
  /* eslint-enable */
  public touched: boolean = false;
  public errorState: boolean = false;
  private errorMsg$: BehaviorSubject<string | null> =
    new BehaviorSubject<string | null>(null);

  public constructor(
    @Optional() @Self() public ngControl: NgControl,
    @Optional() private _parentForm: NgForm,
    @Optional() private _parentFormGroup: FormGroupDirective,
  )
  {
    if (this.ngControl != null)
    {
      this.ngControl.valueAccessor = this;
    }
  }

  public ngOnInit(): void
  {
    this._config_ = makeMathliveInputConfig(this.config);
  }

  public ngAfterViewInit() 
  {
    MathfieldElement.locale = this._config_.locale;
    MathfieldElement.fontsDirectory = this._config_.fontsDirectory;
    MathfieldElement.soundsDirectory = this._config_.soundsDirectory;

    this.mathfield = new MathfieldElement();
    this.mathfield.letterShapeStyle = this._config_.letterShapeStyle;
    this.mathfield.smartMode = this._config_.smartMode;
    this.mathfield.smartFence = this._config_.smartFence;
    this.mathfield.mode = this._config_.parseMode;
    this.mathfield.value = "";

    this.mainElementRef.nativeElement.appendChild(this.mathfield);
    // Disable menu
    this.mathfield.menuItems = [];
    // Setup keybindings for regular keyboard
    this.mathfield.keybindings = [
      // Preserve default keybindings like CTRL+Z
      ...this.mathfield.keybindings,
      // Add additional keybindings from _config_.additionalKeybindings
      // (e.g. when you need to trigger some latex command throw keys)
      ...this._config_.additionalKeybindings,
      // Recognize all chars from _config_.variableChars as variables
      // using \\mathit command as a shell
      ...Array.from(this._config_.variableChars).map(
        (char: string) =>
        {
          return {
             "key": char,
             "command": ["insert", `\\mathit{${char}}`],
          };
        }
      ),
      // Restrict to use all chars from _config_.restrictedChars
      ...Array.from(this._config_.restrictedChars).map(
        (char: string) =>
        {
          return {
             "key": char,
             "command": [],
          };
        }
      )
    ];
    // Disable shortcuts like 'pi' which transforms into \\pi
    this.mathfield.inlineShortcuts = {};
    // Define and intercept multi character variables
    if (this._config_.variableRegex != null)
      this.mathfield.onInlineShortcut = (_mf, s) => 
      {
        if (this._config_.variableRegex!.test(s)) return `\\mathit{${s}}`;
        return "";
      };

    // Add extra styles for shadow root
    let style = document.createElement("style");
    style.innerHTML = getShadowRootExtraStyles(
      this._config_.virtualKeyboardTxt
    );
    this.mathfield.shadowRoot?.appendChild(style);

    this.mathfield.addEventListener("focusin", () => 
    {
      this.focus.emit();
      window.mathVirtualKeyboard.layouts =
        this.virtualKeyboardLayouts
          ?? [mathliveDefaultVKLayout];
    });

    this.mathfield.addEventListener("focusout", () => 
    {
      this.touched = true;
      this.onTouched();
      this.blur.emit();
    });

    this.mathfield.addEventListener("change", () => 
    {
      this.mathfield.blur();
      this.complete.emit();
    });

    this.mathfield.addEventListener("input", () => 
    {
      this.onChange(this.mathfield.getValue("latex"));
      this.checkValidation();
      this.inputValue.emit(
        this._config_.outputFormats.map(
          (format: MathliveOutputFormat) => this.mathfield.getValue(format)
        )
      );
    });

    if (this.addLatexEvent !== undefined)
      this.addLatexEventSubscription = this.addLatexEvent.subscribe({
        next: (latexTxt: string | null) =>
        {
          if (latexTxt != null)
            this.mathfield.insert(
              latexTxt,
              { focus: true, feedback: true, mode: "math", format: "auto" }
            );
        }
      });

    this.errorMsg$.subscribe({
      next: (err: string | null) =>
      {
        if (err == null)
          this.mathfield.style.cssText = `
            content: "";
            padding-bottom: 0rem;
          `;
        else
          this.mathfield.style.cssText = `
            content: "${err}";
            padding-bottom: 0.375rem;
            border-color:
              var(--mdc-outlined-text-field-error-outline-color) !important;
          `;
      }
    });
  }

  private checkValidation(): void
  {
    if (this.ngControl != null)
    {
      const { errors } = this.ngControl;
      if (errors != null)
      {
        const errorName: string = Object.keys(errors)[0];
        if (this.customErrorMessages !== undefined
          && this.customErrorMessages.has(
            errorName as InputValidationErrorCode
          )
        )
          this.errorMsg$.next(this.customErrorMessages.get(
            errorName as InputValidationErrorCode
          ) ?? "");
        else
          return this.errorMsg$.next(
            getDefaultErrorMessage(errorName, errors[errorName])
          );
      }
      else
        this.errorMsg$.next(null);
    }
  }

  public ngOnDestroy(): void
  {
    this.addLatexEventSubscription?.unsubscribe();
  }

  public writeValue(val: string | null, firstTime?: boolean): void
  {
    if (this.mathfield !== undefined)
    {
      this.mathfield.setValue(val ?? "");
      if (firstTime !== false)
        this.checkValidation();
    }
    else
      setTimeout(() =>
      {
        this.writeValue(val, false);
      }, 100);
  }

  public registerOnChange(fn: any): void
  {
    this.onChange = fn;
  }

  public registerOnTouched(fn: any): void
  {
    this.onTouched = fn;
  }

  public ngDoCheck(): void
  {
    if (this.ngControl != null)
    {
      this.updateErrorState();
    }
  }

  private updateErrorState(): void
  {
    const parent: NgForm | FormGroupDirective | null =
      this._parentFormGroup != null
        ? this._parentFormGroup
        : (this._parentForm != null
          ? this._parentForm
          : null);

    const oldState: boolean = this.errorState;
    const newState: boolean =
      (this.ngControl == null ? false : (this.ngControl.invalid ?? false))
        && (this.touched || (parent != null && parent.submitted));

    if (oldState !== newState)
    {
      this.errorState = newState;
      this.checkValidation();
    }
  }
}
