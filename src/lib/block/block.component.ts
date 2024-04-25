import {
  Component,
  ContentChild,
  Directive,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  OnInit,
  SimpleChanges,
  TemplateRef
} from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

@Directive({
  selector: "[blockContent]"
})
export class BlockContentDirective
{
  public constructor(public templateRef: TemplateRef<unknown>) {}
}

@Component({
  selector: "ngx-kit-block",
  templateUrl: "./block.component.html",
  styleUrls: []
})
export class BlockComponent implements OnInit, OnChanges
{
  @ContentChild(TemplateRef) public template: TemplateRef<object>;

  @Input() public extraClass = "";

  // Icon path for the refresh button
  @Input() public refreshIconPath: string = "";

  // Optional array of extra classes for the refresh button
  // Width can be specified only with tailwind class '!w-',
  // height - with 'h-' or '!h-'
  // There are default width and height if they wasn't specified
  @Input() public refreshBtnExtraClasses: string[] = [];

  // Whether the block loading ends with error.
  // - If null or '' - no errors
  // - If some string - an error has occurred, and it must be displayed
  //                    with reload button
  // - If some string with only spaces - an error has occurred, and only
  //                                     reload button must be displayed
  @Input() public errorMsg: string | null = null;
  private errorMsgSubject: BehaviorSubject<string | null> =
    new BehaviorSubject<string | null>(null);
  public errorMsg$: Observable<string | null> = 
    this.errorMsgSubject.asObservable();

  // Whether the block is loaded.
  // - If false - display the loading state
  // - If null - treat as false, in case of `| async` pipe unpacking
  @Input() public isLoaded: boolean | null = true;
  private isLoadedSubject: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(true);
  public isLoaded$: Observable<boolean> = this.isLoadedSubject.asObservable();

  @Output() public refresh: EventEmitter<any> = new EventEmitter<any>();

  private readonly BaseClasses: string[] = [
    "container",
    "shadow",
    "mx-auto",
    "p-3"
  ];
  private readonly DefaultClasses: string[] = this.BaseClasses.concat([
    "bg-c30"
  ]);
  private readonly LoadingClasses: string[] = this.BaseClasses.concat([
    "animate-pulse",
    "bg-c30"
  ]);

  public html: { classes: string[] } = {
    classes: []
  };

  public ngOnInit(): void
  {
    if (this.isLoaded === null)
    {
      this.isLoaded = false;
    }

    this.isLoaded$.subscribe({
      next: v =>
      {
        v
          ? this.html.classes = this.DefaultClasses
          : this.html.classes = this.LoadingClasses;

        this.html.classes = this.html.classes.concat(
          ...this.extraClass.split(" ")
        );
      }
    });
  }

  public ngOnChanges(changes: SimpleChanges): void
  {
    if (changes["isLoaded"] != null)
    {
      this.isLoadedSubject.next(changes["isLoaded"].currentValue);
    }

    if (changes["errorMsg"] != null)
    {
      this.errorMsgSubject.next(changes["errorMsg"].currentValue);
    }
  }

  public getRefreshImgNgClasses(): string[]
  {
    let imgClasses: Set<string> = new Set<string>(["w-8", "h-8"]);
    for (const eclass of this.refreshBtnExtraClasses)
    {
      if (eclass.startsWith("!w-"))
        imgClasses.delete("w-8");

      if (eclass.startsWith("h-") || eclass.startsWith("!h-"))
        imgClasses.delete("h-8");
    }
    return Array.from(imgClasses.values());
  }
}
