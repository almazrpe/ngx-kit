import { Component, Input, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { PaginationItem } from "../models";
import { BehaviorSubject } from "rxjs";

@Component({
  selector: 'ngx-minithings-pagination-ref-btn',
  templateUrl: './pagination-ref-btn.component.html',
  styles: []
})
export class PaginationRefBtnComponent implements OnInit
{
  @Input() public paginationItem: PaginationItem;
  public btnText$: BehaviorSubject<string> =
    new BehaviorSubject<string>("");

  public constructor(
    private router: Router,
  ) { }

  public ngOnInit(): void
  {
    this.btnText$.next(this.paginationItem.text);
  }

  public goPaginationItemLink(paginationItem: PaginationItem): void
  {
    this.router.navigate([paginationItem.route]);
  }
}
