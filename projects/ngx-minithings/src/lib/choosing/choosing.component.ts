import { Component, EventEmitter, Input, OnChanges, OnInit, Output }
  from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { ChoosingControlType, ChoosingControl } from "./choosing-control";
import { DatalistOption } from "../datalist/datalist-option";
import { BaseError } from "src/app/utils/errors";
import { InputType } from "../input/input-type";
import { conditionValidatorWrapper } from "../condition.validator";
import { BehaviorSubject, Observable, map } from "rxjs";
import { SelectedInputService }
  from "../input/selected-input/selected-input.service";

/**
 * Gives a single form field in a separate form to choose something and then
 * callbacks with the chosen option.
 */
@Component({
  selector: "util-choosing",
  templateUrl: "./choosing.component.html",
  styles: [
  ]
})
export class ChoosingComponent implements OnInit, OnChanges
{
  public InputType = InputType;
  public ControlType = ChoosingControlType;

  @Input() public choosingControl: ChoosingControl;
  @Input() public finishButtonText: string;

  @Output() public result: EventEmitter<any> = new EventEmitter<any>();

  public choosingControlOptions: DatalistOption<any>[];
  public inputType: InputType;
  public inputMin: number;
  public inputMax: number;

  public isFinished: boolean;

  private isDatalistMatched$: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);

  private isDatalistMatchedValidatorCondition$: Observable<boolean>;

  public form: FormGroup;

  private chosenData$: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private isFilled$: Observable<boolean>;

  public constructor(
    private selectedInputService: SelectedInputService
  ) {}

  public ngOnInit(): void
  {
    this.isFilled$ = this.chosenData$.pipe(
      map((chosenData: any) =>
      {
        return <boolean>chosenData ? true : false;
      })
    );
    this.isDatalistMatchedValidatorCondition$ = this.isDatalistMatched$.pipe(
      map((isDatalistMatched: boolean) =>
      {
        if (this.choosingControl.type === ChoosingControlType.DATALIST)
        {
          return isDatalistMatched;
        }
        else
        {
          // for non-datalist controls always pass this option to not lock the
          // form
          return true;
        }
      })
    );

    const validators: any[] = [];
    const asyncValidators: any[] = [
      conditionValidatorWrapper(
        this.isFilled$,
        "required"
      ),
      conditionValidatorWrapper(
        this.isDatalistMatchedValidatorCondition$,
        "datalistNoMatch"
      )
    ];
    this.form = new FormGroup({
      choosing: new FormControl(null, validators, asyncValidators)
    });
  }

  public ngOnChanges(): void
  {
    this.isFinished = false;

    this.choosingControlOptions =
      this.choosingControl.options
        ? this.choosingControl.options : [];

    this.inputType =
      this.choosingControl.inputType
        ? this.choosingControl.inputType : InputType.TEXT;

    this.inputMin =
      this.choosingControl.inputMin != null
      && isNaN(this.choosingControl.inputMin) == false
        ? this.choosingControl.inputMin : 0;

    this.inputMax =
      this.choosingControl.inputMax != null
      && isNaN(<number>this.choosingControl.inputMin) == false
      && this.choosingControl.inputMax != 0
        ? this.choosingControl.inputMax : 100000;
  }

  public setDatalistMatched(flag: boolean): void
  {
    this.isDatalistMatched$.next(flag);
    // force call async validator to retrieve the latest flag
    this.form.controls.choosing.updateValueAndValidity();
  }

  public onInputValue(value: any): void
  {
    // do nothing on teardown form reset inputs
    if (this.isFinished)
    {
      return;
    }

    let finalValue: any;

    if (this.inputType === InputType.NUMBER)
    {
      finalValue = Number.parseInt(value);
    }
    else
    {
      finalValue = value;
    }

    this.chosenData$.next(finalValue);
    this.form.controls.choosing.updateValueAndValidity();
  }

  public finish(): void
  {
    if (this.chosenData$.value === null)
    {
      throw new BaseError("data is not chosen to finish");
    }

    this.isFinished = true;
    this.selectedInputService.deselect();
    this.result.emit(this.chosenData$.value);
    this.clear();
  }

  private clear(): void
  {
    this.chosenData$.next(null);
    this.form.reset();
  }
}
