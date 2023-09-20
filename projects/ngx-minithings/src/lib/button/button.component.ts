import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from "@angular/core";
import { BehaviorSubject, Observable, ReplaySubject } from "rxjs";
import { EventPlus, createEventPlus } from "../event-plus";

export enum ButtonMode {
  DEFAULT = 0,
  HEADER = 1,
  DANGER = 2,
  BOOKMARK_ACTIVE = 3,
  DIMMED = 4,
  WARNING = 5,
  SUCCESS = 6,
  CONTROLS = 7
}

@Component({
  selector: "ngx-minithings-button",
  templateUrl: "./button.component.html",
  styleUrls: ["../tailwind.css"]
})
export class ButtonComponent implements OnInit, OnChanges
{
  @Input() public type = "submit";
  @Input() public mode: ButtonMode = ButtonMode.DEFAULT;
  @Input() public isEnabled: boolean | null = true;
  @Input() public extraCssClasses: string[] | null = null;
  @Input() public extraData: object;

  @Output() public clickFunc: EventEmitter<EventPlus> =
    new EventEmitter<EventPlus>();

  private modeSubject: BehaviorSubject<ButtonMode> =
    new BehaviorSubject<ButtonMode>(this.mode);
  public mode$: Observable<ButtonMode> = this.modeSubject.asObservable();

  public cssClasses$: ReplaySubject<string[]> =
    new ReplaySubject<string[]>();

  private html: {classes: string[]} = {
    classes: []
  };

  private CssClassesOrdered: Array<Array<string>> = [
    // DEFAULT
    [
      "bg-c10", "text-c10-text", "rounded", "shadow",
      "hover:bg-c10-active", "p-2", "w-full",
      "disabled:bg-c-disabled", "disabled:shadow-none",
      "flex", "items-center", "justify-center"
    ],
    // HEADER
    [
      "text-c10-text", "rounded", "hover:bg-c30", "p-0",
      "w-full",
      "disabled:bg-c-disabled", "disabled:shadow-none",
      "flex", "items-center", "justify-center"
    ],
    // DANGER
    [
      "bg-red-500", "text-c10-text", "rounded", "hover:bg-red-300",
      "shadow", "p-2", "w-full",
      "disabled:bg-c-disabled", "disabled:shadow-none",
      "flex", "items-center", "justify-center"
    ],
    // BOOKMARK_ACTIVE
    [
      "bg-slate-400", "text-c10-text", "rounded",
      "shadow", "p-2", "w-full",
      "disabled:bg-c-disabled", "disabled:shadow-none",
      "flex", "items-center", "justify-center"
    ],
    // DIMMED
    [
      "bg-c30", "text-c-text", "rounded", "shadow",
      "hover:bg-c10-active", "p-2", "w-full",
      "disabled:bg-c-disabled", "disabled:shadow-none",
      "flex", "items-center", "justify-center"
    ],
    // WARNING
    [
      "bg-yellow-500", "text-c10-text", "rounded", "hover:bg-yellow-300",
      "shadow", "p-2", "w-full",
      "disabled:bg-c-disabled", "disabled:shadow-none",
      "flex", "items-center", "justify-center"
    ],
    // SUCCCESS
    [
      "bg-green-500", "text-c10-text", "rounded", "hover:bg-green-300",
      "shadow", "p-2", "w-full",
      "disabled:bg-c-disabled", "disabled:shadow-none",
      "flex", "items-center", "justify-center"
    ],
    // CONTROLS
    [
      "text-c10-text", "rounded", "hover:bg-gray-200", "hover:bg-opacity-70",
      "p-0", "w-full",
      "disabled:bg-c-disabled", "disabled:shadow-none",
      "flex", "items-center", "justify-center"
    ],
  ];

  public ngOnInit(): void
  {
    this.mode$.subscribe({
      next: mode =>
      {
        this.html.classes = this.CssClassesOrdered[mode];
      }
    });

    if (this.isEnabled === undefined)
    {
      this.isEnabled = false;
    }
    this.setCSSClasses();
  }

  public ngOnChanges(changes: SimpleChanges): void
  {
    if (changes["mode"] != null)
    {
      this.modeSubject.next(changes["mode"].currentValue);
      this.setCSSClasses();
    }
    if (changes["isEnabled"] != null)
    {
      this.isEnabled =
        changes["isEnabled"].currentValue !== undefined
          ? changes["isEnabled"].currentValue : false;
      this.setCSSClasses();
    }
  }

  public click(event: Event): void
  {
    const eventPlus: EventPlus = createEventPlus(
      event,
      {
        extraData: this.extraData
      }
    );
    this.clickFunc.emit(eventPlus);
  }

  private getCSSClasses(): string[]
  {
    const finalClasses: string[] = this.html.classes;
    if (this.extraCssClasses !== null)
    {
      finalClasses.push(...this.extraCssClasses);
    }
    return finalClasses;
  }

  private setCSSClasses(): void
  {
    const cssClasses: string[] = Object.assign([], this.getCSSClasses());
    if (this.isEnabled == null || this.isEnabled == false)
    {
      // wrapped button in angular is not disabled logically, even if the right
      // option is passed, but workaround is to add class `pointer-events-none`
      // https://stackoverflow.com/a/70683035
      cssClasses.push("pointer-events-none");
    }
    this.cssClasses$.next(cssClasses);
  }
}
