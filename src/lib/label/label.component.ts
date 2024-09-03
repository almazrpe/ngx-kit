import {
  Component,
  OnInit,
  AfterViewInit,
  Input,
  ElementRef,
  ViewChild
} from "@angular/core";

@Component({
  selector: "ngx-kit-label",
  templateUrl: "./label.component.html",
  styleUrls: []
})
export class LabelComponent implements OnInit, AfterViewInit {
  @ViewChild("main", { read: ElementRef }) public mainElementRef: ElementRef;
  @Input() public title: string = "...";
  @Input() public bgColor: string | undefined = undefined;
  @Input() public textColor: string | undefined = undefined;
  @Input() public extraCssClasses: string[] | null = null;
  @Input() public isShrunk: boolean = false;

  public ngOnInit(): void {
    this.title = this.title.toUpperCase();
  }

  public ngAfterViewInit(): void {
    this.mainElementRef.nativeElement.style.backgroundColor =
      this.bgColor ?? "#036eb7";
    this.mainElementRef.nativeElement.style.color =
      this.textColor ?? "#ffffff";
  }
}
