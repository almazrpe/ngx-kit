import {
  Component,
  ViewChild,
  ElementRef,
  OnInit,
  OnDestroy,
  AfterViewInit,
  EventEmitter,
  Input,
  Output
} from "@angular/core";
import { Observable, of, Subscription } from "rxjs";
import { MathfieldElement, VirtualKeyboardLayout } from "mathlive";
import { getShadowRootExtraStyles } from "./shadow-root-design";
import {
  MathliveInputConfig,
  makeMathliveInputConfig,
  MathliveOutputFormat,
  mathliveDefaultVirtualKeyboardLayout
} from "./models";

@Component({
  selector: "ngx-kit-mathlive-input",
  templateUrl: "./mathlive-input.component.html",
  styleUrls: ["./mathlive-design.scss"]
})
export class MathliveInputComponent implements AfterViewInit, OnInit, OnDestroy
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
  @Input() public virtualKeyboardLayouts: Array<VirtualKeyboardLayout> = [
    //"greek",
    mathliveDefaultVirtualKeyboardLayout
  ];
  /**
   * Object that allows you to add any latex string at the current
   * caret position in the input field
   */
  @Input() public addLatexEvent: Observable<string | null> = of(null);

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
    this.mathfield.value = this._config_.initialValue;

    this.mainElementRef.nativeElement.appendChild(this.mathfield);
    // Disable menu
    this.mathfield.menuItems = [];
    // Setup keybindings
    this.mathfield.keybindings = [
      // Preserve default keybindings like CTRL+Z
      ...this.mathfield.keybindings,
      // Restrict to use '\' for raw latex input
      {
         "key": "\\",
         "command": [],
      },
      {
         "key": "\"",
         "command": [],
      },
      {
         "key": ",",
         "command": ["insert", ","],
      },
      {
         "key": "?",
         "command": ["insert", ","],
      }
    ].concat(
      Array.from(this._config_.restrictedChars).map(
        (char: string) => 
        {
          return {
             "key": char,
             "command": [],
          };
        }
      )
    );
    // Disable shortcuts like 'pi' which transforms into \pi
    this.mathfield.inlineShortcuts = {};

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
        this.virtualKeyboardLayouts;
    });

    this.mathfield.addEventListener("focusout", () => 
    {
      this.blur.emit();
    });

    this.mathfield.addEventListener("change", () => 
    {
      this.mathfield.blur();
      this.complete.emit();
    });

    this.mathfield.addEventListener("input", () => 
    {
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
  }

  public ngOnDestroy(): void
  {
    this.addLatexEventSubscription?.unsubscribe();
  }
}
