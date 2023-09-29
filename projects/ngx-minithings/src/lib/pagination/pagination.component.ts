import { Component, OnInit, Input } from "@angular/core";
import { BehaviorSubject, Observable, tap } from "rxjs";
import {
  PaginationItem,
  PaginationFilter,
  PaginationConfig,
  PaginationViewType
} from "./models";
import { ButtonMode } from "../button/button.component";

@Component({
  selector: 'ngx-minithings-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: []
})
export class PaginationComponent implements OnInit
{
  // List of items for the pagination
  @Input() public paginationItems: PaginationItem[];
  // List of available filters for the pagination
  @Input() public paginationFilters: PaginationFilter[];
  // Configuration object for the pagination
  @Input() public config: PaginationConfig =
    {
      itemCntPerPage: 1,
      visiblePagesCnt: 5,
      viewType: PaginationViewType.List
    };

  // Lists of items and filters that are active and on the screen
  public paginationItems$: BehaviorSubject<PaginationItem[]> =
    new BehaviorSubject<PaginationItem[]>([]);
  public paginationFilters$: BehaviorSubject<PaginationFilter[]> =
    new BehaviorSubject<PaginationFilter[]>([]);

  // Imported modules for html
  public MathModule: any = Math;
  public BtnMode: any = ButtonMode;
  public PagViewType: any = PaginationViewType;

  public pageCnt: number;
  public curPage: number = 0;
  public leftSlice: number = 0;

  public isFiltersWindowShown: boolean = false;
  public isAvailableFiltersShown: boolean = false;
  private curFilterValues: Map<string, string> = new Map<string, string>([]);

  public ngOnInit(): void
  {
    this.paginationItems$.next(this.paginationItems);

    this.pageCnt = this.paginationItems.length > 1
                   ? Math.ceil(this.paginationItems.length /
                       this.config.itemCntPerPage)
                   : 1;
  }

  public getNextPage(): void
  {
    this.curPage+=1;
    if (this.curPage >= this.config.visiblePagesCnt - 2)
    {
      this.leftSlice+=1;
      if (this.leftSlice > this.pageCnt - this.config.visiblePagesCnt)
        this.leftSlice = this.pageCnt - this.config.visiblePagesCnt;
    }
  }

  public getPreviousPage(): void
  {
    this.curPage-=1;
    if (this.curPage < this.pageCnt - this.config.visiblePagesCnt + 2)
    {
      this.leftSlice-=1;
      if (this.leftSlice < 0)
        this.leftSlice = 0;
    }
  }

  public getPage(pageNum: number): void
  {
    this.curPage = pageNum;
    this.leftSlice = this.curPage - this.config.visiblePagesCnt + 3;
    if (this.leftSlice > this.pageCnt - this.config.visiblePagesCnt)
      this.leftSlice = this.pageCnt - this.config.visiblePagesCnt;
    else if (this.leftSlice < 0)
      this.leftSlice = 0;
  }

  public toggleFiltersWindow(): void
  {
    this.isFiltersWindowShown = !this.isFiltersWindowShown;
  }

  public toggleAvailableFilters(): void
  {
    this.isAvailableFiltersShown = !this.isAvailableFiltersShown;
  }

  public dropFilter(filterId: string): void
  {
    this.paginationFilters$.next(
      this.paginationFilters$.value.filter(f => {return f.id !== filterId}));

    this.curFilterValues.delete(filterId);
    this.refreshPages();
  }

  public addFilter(filterId: string): void
  {
    for (let filter of this.paginationFilters$.value)
    {
      if (filter.id == filterId)
        return;
    }

    for (let filter of this.paginationFilters)
    {
      if (filter.id == filterId){
        let newPagFilters: PaginationFilter[] = this.paginationFilters$.value;
        newPagFilters.push(filter);
        this.paginationFilters$.next(newPagFilters);
      }
    }

    this.isFiltersWindowShown = true;
  }

  public filterChange(filterId: string, event: any): void
  {
    this.curFilterValues.set(filterId, event.target.value);
    this.refreshPages();
  }

  private refreshPages(): void
  {
    this.paginationItems$.next(
      this.paginationItems.filter(item =>
      {
        for (let fid of this.curFilterValues.keys())
        {
          let flag: boolean = false;
          for (let fvalue of item.filterValues)
          {
            if (fvalue.filterId == fid)
            {
              flag = true;
              if (fvalue.filterValue != this.curFilterValues.get(fid)
                  && !String(fvalue.filterValue).toLowerCase().includes(
                        String(this.curFilterValues.get(fid)).toLowerCase()))
                return false
            }
          }
          if (flag == false)
            return false;
        }
        return true;
      }));

    this.pageCnt = this.paginationItems$.value.length > 1
                   ? Math.ceil(this.paginationItems$.value.length /
                       this.config.itemCntPerPage)
                   : 1;
    this.curPage = 0;
    this.leftSlice = 0;
  }

}