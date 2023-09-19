import {
  Component,
  ContentChild,
  Directive,
  Input,
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
  selector: "minithings-block",
  templateUrl: "./block.component.html",
  styleUrls: ["../tailwind.css"]
})
export class BlockComponent implements OnInit, OnChanges
{
  @ContentChild(TemplateRef) public template: TemplateRef<object>;

  @Input() public extraClass = "";

  // Whether the block is loaded.
  // - If false - display the loading state
  // - If null - treat as false, in case of `| async` pipe unpacking
  @Input() public isLoaded: boolean | null = true;

  private isLoadedSubject: BehaviorSubject<boolean> =
    new BehaviorSubject<boolean>(true);
  public isLoaded$: Observable<boolean> = this.isLoadedSubject.asObservable();

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

  public html: {classes: string[]} = {
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
  }
}
