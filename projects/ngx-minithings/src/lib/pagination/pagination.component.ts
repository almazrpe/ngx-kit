import { Component, OnInit, Input } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject } from "rxjs";
import {
  PaginationItem,
  PaginationFilter,
  PaginationConfig,
  PaginationViewType,
  TableColumn,
  SortTableColumn,
  SortColumnMode
} from "./models";
import { InputType } from "../input/input-type";
import { ButtonMode } from "../button/button.component";
import { StatusCircleMode } from "../status-circle/status-circle.component";

@Component({
  selector: "ngx-minithings-pagination",
  templateUrl: "./pagination.component.html",
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
      viewType: PaginationViewType.Table
    };

  // Lists of items and filters that are active and on the screen
  public paginationItems$: BehaviorSubject<PaginationItem[]> =
    new BehaviorSubject<PaginationItem[]>([]);
  public paginationFilters$: BehaviorSubject<PaginationFilter[]> =
    new BehaviorSubject<PaginationFilter[]>([]);

  private unsortedPaginationItems: PaginationItem[];
  private unsortedPaginationFilters: PaginationFilter[];

  // Imported modules for html
  public MathModule: any = Math;
  public BtnMode: any = ButtonMode;
  public CircleMode: any = StatusCircleMode;
  public PagViewType: any = PaginationViewType;
  public InpType: any = InputType;
  public SortColMode: any = SortColumnMode;

  public pageCnt: number;
  public curPage: number = 0;
  public leftSlice: number = 0;

  public isFiltersWindowShown: boolean = false;
  private curFilterValues: Map<string, any> = new Map<string, any>([]);

  public tableColumns: TableColumn[] = [];

  public sortChosenColumns: SortTableColumn[] =
    [{
      column: {
        labelText: "Название",
        type: "string"
      },
      mode: SortColumnMode.OFF
    }];

  public constructor(
    private router: Router,
  ) {}

  public ngOnInit(): void
  {
    this.tableColumns.push({
      labelText: "Название",
      type: "string"
    });

    this.paginationItems.forEach((item: PaginationItem, index: number) =>
    {
      for (const key in item.attr)
      {
        if (undefined == this.tableColumns.find(item =>
            {
              return item.labelText == key;
            }))
        {
          this.tableColumns.push({
            labelText: key,
            type: typeof item.attr[key]
          });
        }
      }

      this.paginationItems[index].attr["Название"] = item.text
    });

    this.paginationItems$.next(this.paginationItems);
    this.unsortedPaginationItems = this.paginationItems.concat();
    this.unsortedPaginationFilters = this.paginationFilters.concat();

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

  public dropFilter(filterId: string): void
  {
    const filter: PaginationFilter | undefined =
      this.unsortedPaginationFilters.find(filter=> 
      {
        return filter.id == filterId;
      });
    filter != undefined ? this.paginationFilters.push(filter) : null;

    this.paginationFilters$.next(
      this.paginationFilters$.value.filter(f => {return f.id !== filterId;}));

    this.curFilterValues.delete(filterId);
    this.refreshPages();
  }

  public addFilter(filterId: string): void
  {
    for (const filter of this.paginationFilters$.value)
    {
      if (filter.id == filterId)
        return;
    }

    this.paginationFilters = this.paginationFilters.filter(filter => 
    {
      if (filter.id == filterId)
      {
        const newPagFilters: PaginationFilter[] =
          this.paginationFilters$.value;
        newPagFilters.push(filter);
        this.paginationFilters$.next(newPagFilters);
        return false;
      }
      else
        return true;
    });

    this.isFiltersWindowShown = true;
  }

  public columnFilterChange(event: any): void
  {
    if (event.target.value.length == 0)
    {
      for (const fid of this.curFilterValues.keys())
      {
        if (fid.startsWith("__"))
          this.curFilterValues.delete(fid);
      }
    }
    else
    {
      this.tableColumns.forEach(column => 
      {
        this.curFilterValues.set("__" + column.labelText, event.target.value);
      });
    }
    this.refreshPages();
    this.curPage = 0;
    this.leftSlice = 0;
  }

  public filterChange(filterId: string, event: any): void
  {
    this.curFilterValues.set(filterId, event.target.value);
    this.refreshPages();
    this.curPage = 0;
    this.leftSlice = 0;
  }

  private refreshPages(): void
  {
    this.paginationItems$.next(
      this.paginationItems.filter(item =>
      {
        let isThereColumnFilters: boolean = false;
        let isColumnFilterApproved: boolean = false;

        for (const fid of this.curFilterValues.keys())
        {
          if (fid.startsWith("__"))
          {
            isThereColumnFilters = true;

            for (const key in item.attr)
            {
              if (key == fid.slice(2)
                  && String(item.attr[key]).toLowerCase().includes(
                    String(this.curFilterValues.get(fid)).toLowerCase()))
                isColumnFilterApproved = true;
            }
          }
          else
          {
            let isThereFilter: boolean = false;
            for (const fvalue of item.filterValues)
            {
              if (fvalue.filterId == fid)
              {
                isThereFilter = true;
                if (fvalue.filterValue != this.curFilterValues.get(fid)
                    && !String(fvalue.filterValue).toLowerCase().includes(
                      String(this.curFilterValues.get(fid)).toLowerCase()))
                  return false;
              }
            }
            if (isThereFilter == false)
              return false;
          }
        }

        if (isThereColumnFilters == true && isColumnFilterApproved == false)
          return false;
        else
          return true;
      }));

    this.pageCnt = this.paginationItems$.value.length > 1
      ? Math.ceil(this.paginationItems$.value.length /
                       this.config.itemCntPerPage)
      : 1;
  }

  public goLink(route: string): void
  {
    this.router.navigate([route]);
  }

  private sortingCondition(a: PaginationItem,
    b: PaginationItem,
    iter: number): number
  {
    if (iter < 0 || iter >= this.sortChosenColumns.length)
      return 0;

    const chosenColumnName: string =
      this.sortChosenColumns[iter].column.labelText;
    const modeFactor: number = this.sortChosenColumns[iter].mode +
      Math.floor(this.sortChosenColumns[iter].mode / 2) * -3;

    if (( a.attr[chosenColumnName] == undefined
          && b.attr[chosenColumnName] == undefined)
        || a.attr[chosenColumnName] != undefined
           && b.attr[chosenColumnName] != undefined
           && a.attr[chosenColumnName] == b.attr[chosenColumnName])
      return this.sortingCondition(a, b, iter + 1);
    else if (a.attr[chosenColumnName] != undefined
             && b.attr[chosenColumnName] == undefined)
      return -1 * modeFactor;
    else if (a.attr[chosenColumnName] == undefined
             && b.attr[chosenColumnName] != undefined)
      return 1 * modeFactor;
    else if (typeof a.attr[chosenColumnName] == "boolean"
             && typeof b.attr[chosenColumnName] == "boolean"
             && b.attr[chosenColumnName] == true)
      return 1 * modeFactor;
    else if (typeof a.attr[chosenColumnName] == "boolean"
             && typeof b.attr[chosenColumnName] == "boolean"
             && a.attr[chosenColumnName] == true)
      return -1 * modeFactor;
    else if (a.attr[chosenColumnName] > b.attr[chosenColumnName])
      return 1 * modeFactor;
    else
      return -1 * modeFactor;
  }

  public sortPaginationItems(chosenColumn: TableColumn, event: any): void
  {
    if (event.shiftKey == false)
    {
      const oldSortColumn: SortTableColumn | undefined =
        this.sortChosenColumns.find(scolumn =>
          scolumn.column.labelText == chosenColumn.labelText);

      this.sortChosenColumns =
      [{
        column: chosenColumn,
        mode: oldSortColumn == undefined
          ? SortColumnMode.ASC
          : (oldSortColumn.mode + 1) % 3
      }];

      if (this.sortChosenColumns[0].mode != SortColumnMode.OFF)
        this.paginationItems.sort((a, b) => 
        {
          return this.sortingCondition(a, b, 0);
        });
      else
        this.paginationItems = this.unsortedPaginationItems.concat();

      this.refreshPages();
    }
    else
    {
      const oldSortColumnIndex: number =
        this.sortChosenColumns.findIndex(scolumn => 
        {
          return scolumn.column.labelText == chosenColumn.labelText;
        });

      if (oldSortColumnIndex != -1)
      {
        this.sortChosenColumns[oldSortColumnIndex].mode =
          (this.sortChosenColumns[oldSortColumnIndex].mode + 1) % 3;

        if (this.sortChosenColumns[oldSortColumnIndex].mode ==
              SortColumnMode.OFF)
          this.sortChosenColumns.splice(oldSortColumnIndex, 1);
      }
      else
      {
        this.sortChosenColumns.push({
          column: chosenColumn,
          mode: SortColumnMode.ASC
        });
      }

      if (this.sortChosenColumns.length != 0)
        this.paginationItems.sort((a, b) => 
        {
          return this.sortingCondition(a, b, 0);
        });
      else
        this.paginationItems = this.unsortedPaginationItems.concat();

      this.refreshPages();
    }
  }

  public chosenColumnCheck (column: TableColumn,
    modes: SortColumnMode[]): boolean
  {
    const sortColumn: SortTableColumn | undefined =
      this.sortChosenColumns.find(scolumn =>
        scolumn.column.labelText == column.labelText);

    return sortColumn == undefined ? false : modes.includes(sortColumn.mode);
  }

}