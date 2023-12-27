import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";
import { SelectedInput } from "../input/selected-input/selected-input";
import Keyboard from "simple-keyboard";
import englishLayout from "simple-keyboard-layouts/build/layouts/english";
import russianLayout from "simple-keyboard-layouts/build/layouts/russian";
import { SelectedInputService }
  from "../input/selected-input/selected-input.service";
import { SelectedInputEvent } from "../input/selected-input/selected-input";
import { ValueHost } from "../input/selected-input/selected-input";
import { ValueValidatorEvent }
  from "../input/selected-input/value-validator-event";
import { LayoutItem } from "simple-keyboard-layouts/build/interfaces";
import { NavigationEnd, Router } from "@angular/router";
import { Event as GeneralRouterEvent } from "@angular/router";
import { BaseError } from "../err";

@Injectable({
  providedIn: "root"
})
export class KeyboardService
{
  private keyboard: Keyboard;

  private isEnabled: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(false);
  public isEnabled$: Observable<boolean> = this.isEnabled.asObservable();

  private isInitialized = false;
  private selectedInput: SelectedInput<any> | null = null;

  // russian layout is enabled by default
  private enabledLayoutIndex = 1;
  private ENABLED_LAYOUTS: LayoutItem[] = [
    englishLayout,
    russianLayout
  ];
  private enabledLayoutsLength: number;

  public constructor(
    private selectedInputService: SelectedInputService,
    private router: Router
  )
  {
    this.enabledLayoutsLength = this.ENABLED_LAYOUTS.length;

    this.router.events.subscribe({
      next: (event: GeneralRouterEvent) =>
      {
        if (event instanceof NavigationEnd)
        {
          this.clearInterRouteState();
        }
      }
    });
  }

  private clearInterRouteState(): void
  {
    this.disable();
    this.selectedInputService.deselect();
  }


  public get isEnabledValue(): boolean
  {
    return this.isEnabled.value;
  }

  public initialize(): Keyboard
  {
    if (this.isInitialized)
    {
      throw new BaseError("already initialized");
    }
    else
    {
      this.isInitialized = true;
    }

    this.keyboard = new Keyboard({
      onChange: (input: string) => this.onChange(input),
      onKeyPress: (button: any) => this.onKeyPress(button),
      layout: this.ENABLED_LAYOUTS[this.enabledLayoutIndex].layout
    });

    this.selectedInputService.eventBus$.subscribe({
      next: (event: SelectedInputEvent<any>) =>
      {
        this.onSelectedInputEvent(event);
      }
    });

    return this.keyboard;
  }

  /**
   * Selects the next layout for the keyboard.
   */
  private selectNextLayout(): void
  {
    this.enabledLayoutIndex++;
    if (this.enabledLayoutIndex > this.enabledLayoutsLength - 1)
    {
      this.enabledLayoutIndex = 0;
    }
    this.keyboard.setOptions({
      layout: this.ENABLED_LAYOUTS[this.enabledLayoutIndex].layout
    });
  }

  private onSelectedInputEvent(event: SelectedInputEvent<any>): void
  {
    if (!event.isSelected)
    {
      this.unfocus();
      return;
    }
    else if (
      this.selectedInput === null
      || event.selectedInput.id !== this.selectedInput.id
    )
    {
      this.focus(event.selectedInput);
    }

    if (event.host === ValueHost.INPUT)
    {
      if (event.value === ValueValidatorEvent.Clear)
      {
        this.keyboard.clearInput();
        return;
      }

      let stringValue: string = event.value;
      if (typeof event.value === "number")
      {
        stringValue = event.value.toString();
      }

      // only on external value changes change the buffer of the keyboard,
      // in other cases it's already set to required buffer, since the host
      // of an event is keyboard
      this.keyboard.setInput(stringValue);
      // sometimes unreset caret selects unecessary text which gets replaced
      // by new keyboard input
      this.keyboard.setCaretPosition(null);

    }
    else if (event.host !== ValueHost.KEYBOARD)
    {
      throw new BaseError(`unrecognized input value event host=${event.host}`);
    }
  }

  /**
   * Focuses a target to input symbols there.
   */
  private focus(target: SelectedInput<any>): void
  {
    this.selectedInput = target;
  }

  private unfocus(): void
  {
    // input itself will handle blur value validation
    this.selectedInput = null;
  }

  public toggle(): void
  {
    this.isEnabled.next(!this.isEnabled.value);
  }

  public enable(): void
  {
    this.isEnabled.next(true);
  }

  public disable(): void
  {
    this.isEnabled.next(false);
  }

  private onChange(value: string): void
  {
    if (this.selectedInput === null)
    {
      throw new BaseError("no input focused to type into");
    }

    this.selectedInputService.sendKeyboardValue(value);
  }

  private onKeyPress(button: string): void
  {
    switch (button)
    {
      case "{shift}":
        this.handleShift();
        break;
      case "{lock}":
        this.handleCAPS();
        break;
    }
  }

  private handleShift(): void
  {
    this.selectNextLayout();
  }

  private handleCAPS(): void
  {
    const currentLayoutName: string | undefined =
      this.keyboard.options.layoutName;
    const currentShiftToggle: string =
      currentLayoutName === "default" ? "shift" : "default";

    this.keyboard.setOptions({
      layoutName: currentShiftToggle
    });
  }
}
