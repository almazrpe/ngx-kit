import { Component, EventEmitter, Input, OnInit, Output, forwardRef }
  from "@angular/core";
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from "@angular/forms";
import { BehaviorSubject, Subscription } from "rxjs";
import { InputType } from "./input-type";
import { SelectedInputEvent, ValueHost} from "./selected-input/selected-input";
import { SelectedInputService } from "./selected-input/selected-input.service";
import { ValueValidator } from "./selected-input/value-validator";
import { hasOnlyNumbers } from "../num/num";
import { checkValueAgainstValidators } from "./selected-input/helpers";
import { ValueValidatorEvent } from "./selected-input/value-validator-event";
import { StringUtils } from "ngx-minithings/str/str";

@Component({
  selector: "minithings-input",
  templateUrl: "./input.component.html",
  styles: [
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ],
})
export class InputComponent<T> implements OnInit, ControlValueAccessor
{
  @Input() public id: string;
  @Input() public name: string;
  @Input() public localizedName: string;
  @Input() public cssClasses: string[];
  @Input() public required: boolean;
  @Input() public attrList: string[];
  @Input() public min: number;
  @Input() public max: number;
  @Input() public isDefaultInputValidatorsEnabled = true;
  @Input() public isDefaultBlurValidatorsEnabled = true;

  @Input() public inputType: InputType = InputType.TEXT;
  @Input() public placeholder: T = "" as T;

  @Output() public inputValue: EventEmitter<any> = new EventEmitter<any>();
  @Output() public focus: EventEmitter<any> = new EventEmitter<any>();
  @Output() public blur: EventEmitter<any> = new EventEmitter<any>();

  public isEnabled$: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(true);

  private selectedInputEventSubscription: Subscription;
  private inputValueValidators: ValueValidator<T>[];
  private blurValueValidators: ValueValidator<T>[];
  public value$: BehaviorSubject<T> = new BehaviorSubject<T>("" as T);

  public onChange: (value: T) => void;
  public onTouch: () => void;

  public constructor(
    private selectedInputService: SelectedInputService
  ) { }

  public ngOnInit(): void
  {
    const randomId: string = StringUtils.makeid();
    if (this.id == "")
    {
      this.id = randomId;
    }
    if (this.name == "")
    {
      this.name = randomId;
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
                value: event.value
              }
            };
            this.onInput(mockEvent, false);
          }
        }
      });

    if (this.isDefaultInputValidatorsEnabled)
    {
      this.inputValueValidators = this.getInputValueValidators();
    }

    if (this.isDefaultBlurValidatorsEnabled)
    {
      this.blurValueValidators = this.getBlurValueValidators();
    }
  }

  public ngOnDestroy(): void
  {
    this.selectedInputEventSubscription.unsubscribe();
  }

  public setDisabledState(isDisabled: boolean): void
  {
    this.isEnabled$.next(!isDisabled);
  }

  public writeValue(value: T): void
  {
    if (this.selectedInputService.isSelected(this.id))
    {
      this.selectedInputService.sendInputValue(value);
    }

    this.value$.next(value);
  }

  public registerOnChange(fn: any): void
  {
    this.onChange = fn;
  }

  public registerOnTouched(fn: any): void
  {
    this.onTouch = fn;
  }

  public onInput(event: any, shouldSendEvent?: boolean): void
  {
    let value: any = event.target.value;
    const _shouldSendEvent: boolean =
      shouldSendEvent === undefined ? true : shouldSendEvent;
    let isValueChanged: boolean = false;

    if (
      this.isDefaultInputValidatorsEnabled
      && this.inputValueValidators !== undefined
    )
    {
      const validatedValue: T | ValueValidatorEvent | undefined =
        checkValueAgainstValidators(
          value,
          this.inputValueValidators
        );
      if (validatedValue !== undefined)
      {
        isValueChanged = true;
        value = validatedValue;
      }
    }

    this.setValue(value);

    if (
      // if the origin value is changed by validators, an event should be fired
      // even if it was disabled to notify the other recipients (mainly a
      // keyboard) about the change
      (_shouldSendEvent || isValueChanged)
      && this.selectedInputService.isSelected(this.id)
    )
    {
      this.selectedInputService.sendInputValue(value);
    }
  }

  public onFocus(event: any): void
  {
    this.focus.emit(event);

    this.selectedInputService.select(
      {
        id: this.id,
        name: this.localizedName != "" ? this.localizedName : "noname",
        type: this.inputType,
        inputValueValidators: this.inputValueValidators
      },
      this.value$.value
    );
  }

  public onBlur(event: any): void
  {
    if (
      this.isDefaultBlurValidatorsEnabled
      && this.blurValueValidators !== undefined
    )
    {
      const validatedValue: T | ValueValidatorEvent | undefined =
        checkValueAgainstValidators(
          event.target.value,
          this.blurValueValidators
        );
      if (validatedValue !== undefined)
      {
        event.target.value = validatedValue;
      }
    }

    // for inputs with suggested options an additional "teardown" input action
    // should be called for cases where such additional option is picked by
    // an user
    this.onInput(event);

    this.blur.emit(event);
  }

  private getInputValueValidators(): ValueValidator<T>[]
  {
    const valueValidators: ValueValidator<T>[] = [];

    switch (this.inputType)
    {
      case InputType.NUMBER:
        valueValidators.push(this.getNaNValidator());
        break;
    }

    return valueValidators;
  }

  private getBlurValueValidators(): ValueValidator<T>[]
  {
    const valueValidators: ValueValidator<T>[] = [];

    switch (this.inputType)
    {
      case InputType.NUMBER:
        if (this.min !== undefined || this.max !== undefined)
        {
          valueValidators.push(
            this.getMinMaxValueValidator() as ValueValidator<T>
          );
        }
        break;
    }

    return valueValidators;
  }

  private getNaNValidator(): ValueValidator<T>
  {
    return ((value: string): any =>
    {
      if (!hasOnlyNumbers(value))
      {
        return ValueValidatorEvent.Clear;
      }
    });
  }

  private getMinMaxValueValidator(): ValueValidator<number>
  {
    return ((value: string): any =>
    {
      const numericValue: number = value !== "" ? Number(value) : 0;

      if (this.min !== undefined && numericValue < this.min)
      {
        return this.min;
      }
      if (this.max !== undefined && numericValue > this.max)
      {
        return this.max;
      }
    }).bind(
      this
    );
  }

  private setValue(value: T | ValueValidatorEvent): void
  {
    // apply value set only on correct form API initialization, sometimes the
    // input catches old input values from the bus before it has been properly
    // initialized (e.g. on logout transition) - so ensure no error will be
    // raised in such case and such values are just ignored
    if (this.onChange !== undefined)
    {
      switch (value)
      {
        case ValueValidatorEvent.Clear:
          value = (this.min !== undefined ? this.min : "") as T;
          break;
      }
      this.value$.next(value);
      this.onChange(value);
      this.inputValue.emit(value);
    }
  }
}
