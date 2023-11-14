import {
  Component,
  ElementRef,
  Inject,
  Input,
  OnInit,
  OnDestroy,
  Optional,
  Self,
  ViewChild,
  HostBinding
} from "@angular/core";
import { Subject, Subscription } from "rxjs";
import { SelectedInputService }
  from "../selected-input/selected-input.service";
import { ValueValidatorEvent }
  from "../selected-input/value-validator-event";
import { SelectedInputEvent, ValueHost}
  from "../selected-input/selected-input";
import { InputType } from "../input-type";
import {
  FormControl,
  ControlValueAccessor,
  NgControl,
  ValidatorFn,
  NgForm,
  FormGroupDirective
} from "@angular/forms";
import { FocusMonitor } from "@angular/cdk/a11y";
import { BooleanInput, coerceBooleanProperty } from "@angular/cdk/coercion";
import {
  MAT_FORM_FIELD,
  MatFormField,
  MatFormFieldControl,
} from "@angular/material/form-field";
import { ErrorStateMatcher } from "@angular/material/core";
import { getDefaultErrorMessage } from "./error-messages";
//import { MatSelect } from '@angular/material/select';
//import { MatRadioGroup } from '@angular/material/radio';

export class InputErrorStateMatcher implements ErrorStateMatcher
{
  public errorState: boolean = false;
  public isErrorState(): boolean
  {
    return this.errorState;
  }
}

@Component({
  selector: "ngx-minithings-mat-input",
  templateUrl: "./mat-input.component.html",
  styleUrls: ["./mat-design.scss"],
  providers: [
    { provide: MatFormFieldControl, useExisting: MatInputComponent },
  ]
})
export class MatInputComponent<T>
implements OnInit, OnDestroy, ControlValueAccessor, MatFormFieldControl<T>
{
  public static nextId: number = 0;
  @Input() public id: string = `mat-input-${MatInputComponent.nextId++}`;
  @Input() public localizedName: string = "noname";
  @Input() public type: InputType = InputType.Text;
  @Input() public validators: ValidatorFn[] = [];
  @Input() public attrList: string[] = [];

  @Input() public showErrors: boolean = true;
  @Input() public customErrorMessages: Map<string, string> = new Map();

  @ViewChild("main", { read: ElementRef }) public mainElementRef: ElementRef;

  public formControl: FormControl = new FormControl("", {nonNullable: true});
  public stateChanges: Subject<void> = new Subject<void>();
  public matcher = new InputErrorStateMatcher();
  public errorState: boolean = false;
  public focused: boolean = false;
  public touched: boolean = false;
  public controlType: string = "mat-input-comp";
  /* eslint-disable */
  public onChange: (value: any) => void = (_: any) => {};
  public onTouched: () => void = () => {};
  /* eslint-enable */

  private selectedInputEventSubscription: Subscription;

  //public InputType: any = InputType;

  public get empty(): boolean
  {
    // TODO: check empty for different types
    return this.formControl.value == null
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
           || !!this.formControl.value == false;
  }

  @HostBinding("class.floating")
  public get shouldLabelFloat(): boolean
  {
    return this.focused || !this.empty;
  }

  @Input("aria-describedby") public userAriaDescribedBy: string;

  @Input()
  public get placeholder(): string
  {
    return this._placeholder;
  }
  public set placeholder(value: string)
  {
    this._placeholder = value;
    this.stateChanges.next();
  }
  public _placeholder: string;

  @Input()
  public get required(): boolean
  {
    return this._required;
  }
  public set required(value: BooleanInput)
  {
    this._required = coerceBooleanProperty(value);
    this.stateChanges.next();
  }
  public _required: boolean = false;

  @Input()
  public get disabled(): boolean
  {
    return this._disabled;
  }
  public set disabled(value: BooleanInput)
  {
    this._disabled = coerceBooleanProperty(value);
    this._disabled ? this.formControl.disable() : this.formControl.enable();
    this.stateChanges.next();
  }
  private _disabled = false;

  @Input()
  public get value(): T | null
  {
    return this.formControl.value;
  }
  public set value(val: T | null)
  {
    if (val == null)
      this.formControl.reset();
    else
      this.formControl.setValue(val);
    this.stateChanges.next();
  }

  public constructor(
    private selectedInputService: SelectedInputService,
    private _focusMonitor: FocusMonitor,
    private _elementRef: ElementRef<HTMLElement>,
    @Optional() @Inject(MAT_FORM_FIELD) public _formField: MatFormField,
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
      this.matcher.errorState = newState;
      this.stateChanges.next();
    }
  }

  public ngOnInit(): void
  {
    if (this.localizedName == "" || this.localizedName == undefined)
    {
      this.localizedName = "noname";
    }

    this.selectedInputEventSubscription =
      this.selectedInputService.eventBus$.subscribe({
        next: (event: SelectedInputEvent<any>) =>
        {
          if (
            event.selectedInput.id === this.id
            // do not re-accept self-made changes
            && event.host !== ValueHost.INPUT
          )
          {
            // don't resend an input change event back to keyboard, because
            // here the keyboard initiated the change
            const mockEvent: any = {
              target: {
                value: event.value !== ValueValidatorEvent.Clear
                  ? event.value
                  : null
              }
            };
            this.onInput(mockEvent, true);
          }
        }
      });
  }

  public onFocusIn(): void
  {
    if (!this.focused) 
    {
      this.selectedInputService.select(
        {
          id: this.id,
          name: this.localizedName,
          type: this.type,
        },
        this.value
      );

      this.focused = true;
      this.stateChanges.next();
    }
  }

  public onFocusOut(event: FocusEvent): void
  {
    if (!this._elementRef.nativeElement.contains(
      event.relatedTarget as Element))
    {
      // TODO: check working for inputs with suggested options
      // if it doesn't then add virtual keyboard interaction

      this.touched = true;
      this.focused = false;
      this.onTouched();
      this.stateChanges.next();
    }
  }

  public setDescribedByIds(ids: string[]): void
  {
    const controlElement: Element =
      this._elementRef.nativeElement.querySelector(
        ".mat-input-comp-container",
      )!;
    controlElement.setAttribute("aria-describedby", ids.join(" "));
  }

  public onContainerClick(): void
  {
    // TODO: check this function works with big containers
    // if it doesn't return back
    // @ViewChild("main") public mainInput: HTMLInputElement;
    // and use mainInput instead of mainElementRef.nativeElement
    this._focusMonitor.focusVia(this.mainElementRef.nativeElement, "program");
  }

  public writeValue(val: T | null): void 
  {
    this.value = val;
    if (this.selectedInputService.isSelected(this.id))
    {
      this.selectedInputService.sendInputValue(
        val ?? ValueValidatorEvent.Clear
      );
    }
  }

  public registerOnChange(fn: any): void 
  {
    this.onChange = fn;
  }

  public registerOnTouched(fn: any): void 
  {
    this.onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void 
  {
    this.disabled = isDisabled;
  }

  public onInput(event: any, virtualKeyboardInput: boolean = false): void
  {
    const val: any = event.target.value;
    if (virtualKeyboardInput == true)
    {
      switch(this.type)
      {
        case InputType.Number:
          this.mainElementRef.nativeElement.value = val;
          this.mainElementRef.nativeElement.dispatchEvent(
            new Event("input", { bubbles: true }));
          return;
        default:
          this.value = val;
      }
    }
    else
      this.value = val;

    if (this.selectedInputService.isSelected(this.id)
        && virtualKeyboardInput == false)
    {
      this.selectedInputService.sendInputValue(
        (this.value == null || this.value === "")
          ? ValueValidatorEvent.Clear
          : this.value
      );
    }
    this.onChange(this.value);
  }

  public getErrorMessage(): string
  {
    if (this.ngControl != null)
    {
      const { errors } = this.ngControl;
      if (errors != null)
      {
        const errorName: string = Object.keys(errors)[0];
        if (this.customErrorMessages.has(errorName))
          return this.customErrorMessages.get(errorName) ?? "";
        else
          return getDefaultErrorMessage(errorName, errors[errorName]);
      }
    }
    return "UNKNOWN ERROR";
  }

  public ngOnDestroy(): void
  {
    this.stateChanges.complete();
    this._focusMonitor.stopMonitoring(this._elementRef);
  }
}
