import {
    Component,
    EventEmitter,
    forwardRef,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges
} from "@angular/core";
import {
    ControlValueAccessor,
    FormControl,
    FormGroup,
    NG_VALUE_ACCESSOR,
    Validators
} from "@angular/forms";
import { BehaviorSubject } from "rxjs";
import { AlertLevel } from "../alert/models";
import { AlertService } from "../alert/alert.service";
import { InputType } from "../input/input-type";
import { DatalistOption } from "./datalist-option";
import { KeyboardService } from "../keyboard/keyboard.service";
import { StringUtils } from "../str/utils";

/**
 * List with searchable options implementation.
 *
 * Key features is that, user cannot leave input in unselected to any option
 * state, as it could be done in default datalist. If input matches no options
 * provided, the input is cleared and alert is spawned.
 *
 * So output emitter `select` returns finally selected option instead of
 * intermediate changes.
 */
@Component({
    selector: "ngx-kit-datalist",
    templateUrl: "./datalist.component.html",
    styleUrls: [],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => DatalistComponent),
            multi: true
        }
    ],
})
export class DatalistComponent
implements OnInit, ControlValueAccessor, OnChanges {
    @Input() public inputType: InputType = InputType.Text;
    @Input() public labelText: string;
    @Input() public options: DatalistOption[];
    @Input() public isFormRequired: boolean = true;

    @Output() public select: EventEmitter<DatalistOption> =
        new EventEmitter<DatalistOption>();
    @Output() public setDatalistMatched: EventEmitter<boolean> =
        new EventEmitter<boolean>();

    public datalistId: string;

    public options$: BehaviorSubject<DatalistOption[]> =
        new BehaviorSubject<DatalistOption[]>([]);

    public isEnabled$: BehaviorSubject<boolean> =
        new BehaviorSubject<boolean>(true);

    public form: FormGroup;

    public constructor(
        private alertService: AlertService,
        private keyboardService: KeyboardService
    ) {}

    public ngOnInit(): void {
        this.datalistId = StringUtils.makeid();
        this.options$.next(this.options);
        this.form = new FormGroup({
            main: new FormControl(null, Validators.required)
        });
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes["options"] != undefined) {
            this.options$.next(changes["options"].currentValue);
        }
    }

    public onInputValue(value: any): void {
        const isValueMatched: boolean = this.isValueMatchedToOptions(value);
        this.setDatalistMatched.emit(isValueMatched);
        // do not spawn an unmatch alert on typing
        this.emitSelectedConditionally(value, isValueMatched, false);
    }

    public onBlur(): void {
        const value: any = this.form.controls["main"].value;
        // spawn an unmatch alert only on leaving the input
        this.emitSelectedConditionally(
            value,
            this.isValueMatchedToOptions(value),
            true
        );
    }

    private emitSelectedConditionally(
        value: any,
        isValueMatched: boolean,
        isUnmatchAlertSpawned: boolean
    ): void {
        const isValueDefined: boolean = value !== ""
            && value !== null
            && value !== undefined;

        if (
            !isValueMatched && isValueDefined
        ) {
            // alert should be spawned only on closed keyboard, to not distract
            // user on typing, since he will unfocus the target field to type
            // new data
            if (
                !this.keyboardService.isEnabledValue && isUnmatchAlertSpawned
            ) {
                this.spawnUnmatchAlert(value);
            }
        } else if (isValueDefined) {
            this.emitSelectedOption(value);
        }
    }

    public writeValue(value: any): void {
        this.form.controls["main"].setValue(value);
    }

    public registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    public registerOnTouched(fn: any): void {
        this.onTouch = fn;
    }

    public setDisabledState(isDisabled: boolean): void {
        this.isEnabled$.next(!isDisabled);
    }

    public onChange: (value: any) => void;

    public onTouch: () => void;

    private emitSelectedOption(value: any): void {
        this.select.emit(
            this.findOptionByValue(value)
        );
    }

    private spawnUnmatchAlert(value: any): void {
        this.alertService.spawn({
            level: AlertLevel.Warning,
            msg: `Entered value ${
                value
            } does not match any option from the list`
        });
    }

    private findOptionByValue(value: string): DatalistOption {
        return (
            this.options.find(option => option.value === value)
            || ((): any => {
                throw new Error(`couldn't find option with value ${value}`);
            })()
        );
    }

    /**
     * Checks if current input value exists in options provided.
     */
    private isValueMatchedToOptions(value: any): boolean {
        return this.options.map(option => option.value).includes(value);
    }
}
