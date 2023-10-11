import { Injectable } from "@angular/core";
import { Observable, ReplaySubject } from "rxjs";
import { SelectedInput, SelectedInputEvent, ValueHost }
  from "./selected-input";
import { NoSelectedInputError } from "./errors";

/**
 * Manages the state of the selected input.
 */
@Injectable({
  providedIn: "root"
})
export class SelectedInputService
{
  private _eventBus$: ReplaySubject<SelectedInputEvent<any>> =
    new ReplaySubject<SelectedInputEvent<any>>;
  public eventBus$: Observable<SelectedInputEvent<any>> =
    this._eventBus$.asObservable();

  private selectedInput: SelectedInput<any> | null = null;

  // constructor() { }

  /**
   * Checks if some id is currently selected one.
   */
  public isSelected(id: string): boolean
  {
    if (this.selectedInput !== null)
    {
      return id === this.selectedInput.id;
    }
    else
    {
      return false;
    }
  }

  public sendKeyboardValue(value: string): void
  {
    this._eventBus$.next({
      host: ValueHost.KEYBOARD,
      selectedInput: this.checkCanSend(),
      value: value,
      isSelected: true
    });
  }

  public sendInputValue(value: any): void
  {
    this._eventBus$.next({
      host: ValueHost.INPUT,
      selectedInput: this.checkCanSend(),
      value: value,
      isSelected: true
    });
  }

  public select(input: SelectedInput<any>, initialValue: any): void
  {
    this.selectedInput = input;
    // the host of newly selected input is always INPUT
    this.sendInputValue(initialValue);
  }

  public deselect(): void
  {
    try
    {
      this._eventBus$.next({
        host: ValueHost.INPUT,
        selectedInput: this.checkCanSend(),
        value: "",
        isSelected: false
      });
    }
    catch (error)
    {
      if (error instanceof NoSelectedInputError)
      {
        return;
      }
      else
      {
        throw error;
      }
    }
    this.selectedInput = null;
  }

  private checkCanSend(): SelectedInput<any>
  {
    if (this.selectedInput === null)
    {
      throw new NoSelectedInputError("cannot send value: no selected input");
    }
    else
    {
      return this.selectedInput;
    }
  }
}
