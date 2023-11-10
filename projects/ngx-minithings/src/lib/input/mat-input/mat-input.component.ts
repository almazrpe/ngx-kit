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
  FormGroup,
  ControlValueAccessor,
  NgControl,
  ValidatorFn
} from "@angular/forms";
import { FocusMonitor } from "@angular/cdk/a11y";
import { BooleanInput, coerceBooleanProperty } from "@angular/cdk/coercion";
import {
  MAT_FORM_FIELD,
  MatFormField,
  MatFormFieldControl,
} from "@angular/material/form-field";

//import { MatSelect } from '@angular/material/select';
//import { MatRadioGroup } from '@angular/material/radio';

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
  @Input() public validators: ValidatorFn[];
  @Input() public attrList: string[] = [];

  @ViewChild("main") public mainInput: HTMLInputElement;

  public inputForm: FormGroup;
  public stateChanges: Subject<void> = new Subject<void>();
  public focused: boolean = false;
  public touched: boolean = false;
  public controlType: string = "mat-input-comp";
  /* eslint-disable */
  public onChange: (value: any) => void = (_: any) => {};
  public onTouched: () => void = () => {};
  /* eslint-enable */

  private selectedInputEventSubscription: Subscription;

  //public IType: any = InputType;

  public get empty(): boolean
  {
    const {
      value: {main},
    } = this.inputForm;

    return main == null || (typeof main == "string" && main == "");
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
    this._disabled ? this.inputForm.disable() : this.inputForm.enable();
    this.stateChanges.next();
  }
  private _disabled = false;

  @Input()
  public get value(): T | null
  {
    if (this.inputForm.valid) 
    {
      const {
        value: {main},
      } = this.inputForm;
      return main!;
    }
    return null;
  }
  public set value(val: T | null)
  {
    const main: any = val ?? "";
    this.inputForm.setValue({main});
    this.stateChanges.next();
  }

  public get errorState(): boolean
  {
    return this.inputForm.invalid && this.touched;
  }

  public constructor(
    private selectedInputService: SelectedInputService,
    private _focusMonitor: FocusMonitor,
    private _elementRef: ElementRef<HTMLElement>,
    @Optional() @Inject(MAT_FORM_FIELD) public _formField: MatFormField,
    @Optional() @Self() public ngControl: NgControl,
  ) 
  {
    if (this.ngControl != null) 
    {
      this.ngControl.valueAccessor = this;
    }

    this.inputForm = new FormGroup({
      main: new FormControl(""),
    });
  }

  public ngOnInit(): void
  {
    this.inputForm.controls["main"].setValidators(this.validators);
    this.inputForm.controls["main"].updateValueAndValidity();

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
                  : ""
              }
            };
            this.onInput(mockEvent, false);
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

      // TODO: use selectedInputService.deselect() ???

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
    this._focusMonitor.focusVia(this.mainInput, "program");
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
    if (isDisabled) 
    {
      this.inputForm.disable();
    }
    else 
    {
      this.inputForm.enable();
    }
  }

  public onInput(event: any, shouldSendEvent?: boolean): void 
  {
    const val: any = event.target.value;
    const _shouldSendEvent: boolean =
      shouldSendEvent === undefined ? true : shouldSendEvent;
    let isValueChanged: boolean = false;
    let altValue: any = ValueValidatorEvent.Clear;

    if (this.type == InputType.Number)
    {
      if (Number.isNaN(Number(val)) == false)
      {
        const old_value: T | null = this.value;
        altValue = Number(val);
        this.value = altValue as T;
        isValueChanged = old_value === this.value;
      }
      else
      {
        // TODO: bug with null in this.value (because validators),
        // number in the field and trying to add letter into the field
        if (_shouldSendEvent == false)
          isValueChanged = true;
      }
    }
    else
      this.value = val;

    if (
      // if the origin value is changed by validators, an event should be fired
      // even if it was disabled to notify the other recipients (mainly a
      // keyboard) about the change
      (_shouldSendEvent || isValueChanged)
      && this.selectedInputService.isSelected(this.id)
    )
    {
      this.selectedInputService.sendInputValue(this.value ?? altValue);
    }
    this.onChange(this.value);
  }

  public ngOnDestroy(): void
  {
    this.stateChanges.complete();
    this._focusMonitor.stopMonitoring(this._elementRef);
  }

}
