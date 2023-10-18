import {
  Directive,
  HostListener,
  Output,
  Input,
  EventEmitter,
  ElementRef
} from '@angular/core';

@Directive({
  selector: '[paginationOverflowDetect]'
})
export class PaginationOverflowDirective
{
  @Output() public overflowing = new EventEmitter<Event>();
  @Output() public notOverflowing = new EventEmitter<Event>();

  @Input() public curPage: number;
  private oldPage: number = 0;

  public ngOnInit(): void
  {
    this.oldPage = this.curPage;
    setInterval(() => {
      if (this.curPage != this.oldPage)
        this.oldPage = this.curPage;
        this.overflowCheck();
    }, 100);
  }

  constructor(
    public element: ElementRef
  ) {}

  @HostListener('window:load')
  public onLoad(): void { this.overflowCheck(); }

  @HostListener('window:resize')
  public onResize(): void { this.overflowCheck(); }

  private overflowCheck(): void
  {
    if (this.element.nativeElement.scrollWidth >
          this.element.nativeElement.clientWidth)
      this.overflowing.emit();
    else
      this.notOverflowing.emit();
  }

}
