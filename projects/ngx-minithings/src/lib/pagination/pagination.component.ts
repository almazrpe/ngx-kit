import { Component, OnInit, Input } from "@angular/core";
import { Router } from "@angular/router";
import {
  PaginationItem,
  PaginationFilter,
  PaginationConfig,
  PaginationViewType,
  makeConfig,
  TableColumn,
  SortTableColumn,
  SortColumnMode,
  isPaginationIcon,
  isPaginationDateTime
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
  @Input() public paginationItems: PaginationItem[] = [];
  // List of available filters for the pagination
  @Input() public paginationFilters: PaginationFilter[] = [];
  // Configuration object for the pagination
  @Input() public config: PaginationConfig = makeConfig();

  // Lists of items and filters that are active and on the screen
  public activePaginationItems: PaginationItem[] = [];
  public activePaginationFilters: PaginationFilter[] = [];
  public disabledPaginationFilters: PaginationFilter[] = [];

  // Imported modules for html
  public MathModule: any = Math;
  public BtnMode: any = ButtonMode;
  public CircleMode: any = StatusCircleMode;
  public PagViewType: any = PaginationViewType;
  public InpType: any = InputType;
  public SortColMode: any = SortColumnMode;

  public defaultDateTimeFormatters: Intl.DateTimeFormat[] =
    [
      new Intl.DateTimeFormat("ru-RU",
        {
          year: "numeric",
          month: "numeric",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        }),

      new Intl.DateTimeFormat("ru-RU",
        {
          year: "numeric",
          month: "numeric",
          day: "numeric",
        }),

      new Intl.DateTimeFormat("ru-RU",
        {
          hour: "2-digit",
          minute: "2-digit"
        })
    ];

  public pageCnt: number;
  public curPage: number = 0;
  public leftSlice: number = 0;

  public isFiltersWindowShown: boolean = false;
  private curFilterValues: Map<string, any> = new Map<string, any>([]);

  public tableColumns: TableColumn[] = [];
  public sortChosenColumns: SortTableColumn[] = [];

  public paginationItemsCount: number;
  public paginationFiltersCount: number;
  private updateCheckingInterval: number = 1000;

  public isTableOverflowing: boolean = false;

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
        let attrType: string;
        if (isPaginationIcon(item.attr[key]) == true)
          attrType = "PaginationIcon";
        else if (isPaginationDateTime(item.attr[key]) == true)
          attrType = "PaginationDateTime";
        else
          attrType = typeof item.attr[key];

        if (undefined == this.tableColumns.find(column =>
        {
          return column.labelText == key
                 && column.type == attrType;
        }))
        {
          if (attrType == undefined)
            continue;

          this.tableColumns.push({
            labelText: key,
            type: attrType
          });
        }
      }

      this.paginationItems[index].attr["Название"] = item.text;
    });
    console.log(this.tableColumns);
    this.activePaginationItems = this.paginationItems.concat();
    this.disabledPaginationFilters = this.paginationFilters.concat();
    this.paginationItemsCount = this.paginationItems.length;
    this.paginationFiltersCount = this.paginationFilters.length;
    this.pageCnt = this.paginationItems.length > 1
      ? Math.ceil(this.paginationItems.length /
                       this.config.itemCntPerPage)
      : 1;

    setInterval(() => 
    {
      if (this.paginationItems.length != this.paginationItemsCount)
      {
        this.paginationItemsCount = this.paginationItems.length;
        this.paginationItems.forEach((item: PaginationItem, index: number) =>
        {
          this.paginationItems[index].attr["Название"] = item.text;
        });
        this.refreshPages();
      }
      if (this.paginationFilters.length != this.paginationFiltersCount)
      {
        this.paginationFiltersCount = this.paginationFilters.length;
        this.disabledPaginationFilters = this.disabledPaginationFilters.concat(
          this.paginationFilters.filter( mainFilter =>
          {
            const activeCheck: PaginationFilter | undefined =
              this.activePaginationFilters.find(activeFilter =>
              {
                return mainFilter.id == activeFilter.id;
              });

            const disabledCheck: PaginationFilter | undefined =
              this.disabledPaginationFilters.find(disabledFilter =>
              {
                return mainFilter.id == disabledFilter.id;
              });

            return activeCheck == undefined && disabledCheck == undefined;
          }));
      }
    }, this.updateCheckingInterval);
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
      this.paginationFilters.find(filter=>
      {
        return filter.id == filterId;
      });
    filter != undefined ? this.disabledPaginationFilters.push(filter) : null;

    this.activePaginationFilters = this.activePaginationFilters.filter(f =>
    {
      return f.id !== filterId;
    });

    this.curFilterValues.delete(filterId);
    this.refreshPages();
  }

  public addFilter(filterId: string): void
  {
    for (const filter of this.activePaginationFilters)
    {
      if (filter.id == filterId)
        return;
    }

    this.disabledPaginationFilters =
      this.disabledPaginationFilters.filter(filter =>
      {
        if (filter.id == filterId)
        {
          this.activePaginationFilters.push(filter);
          return false;
        }
        else
          return true;
      });

    this.isFiltersWindowShown = true;
  }

  public columnFilterChange(value: any): void
  {
    if (value.length == 0)
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
        this.curFilterValues.set("__" + column.labelText, value);
      });
    }
    this.refreshPages();
    this.curPage = 0;
    this.leftSlice = 0;
  }

  public filterChange(filterId: string, value: any): void
  {
    this.curFilterValues.set(filterId, value);
    this.refreshPages();
    this.curPage = 0;
    this.leftSlice = 0;
  }

  private refreshPages(): void
  {
    this.sortChosenColumns = [];
    this.activePaginationItems =
      this.paginationItems.concat().filter(item =>
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
      });

    this.pageCnt = this.activePaginationItems.length > 1
      ? Math.ceil(this.activePaginationItems.length /
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
      return (modeFactor == 1
        ? -1 * modeFactor
        : 1 * modeFactor);
    else if (a.attr[chosenColumnName] == undefined
             && b.attr[chosenColumnName] != undefined)
      return (modeFactor == 1
        ? 1 * modeFactor
        : -1 * modeFactor);
    else if (isPaginationIcon(a.attr[chosenColumnName]) == true
             && isPaginationIcon(b.attr[chosenColumnName]) == true
             && (a.attr[chosenColumnName].priority >
                   b.attr[chosenColumnName].priority))
      return 1 * modeFactor;
    else if (isPaginationIcon(a.attr[chosenColumnName]) == true
             && isPaginationIcon(b.attr[chosenColumnName]) == true
             && (a.attr[chosenColumnName].priority <=
                   b.attr[chosenColumnName].priority))
      return -1 * modeFactor;
    else if (isPaginationDateTime(a.attr[chosenColumnName]) == true
             && isPaginationDateTime(b.attr[chosenColumnName]) == true
             && a.attr[chosenColumnName].type != 2
             && b.attr[chosenColumnName].type != 2
             && (a.attr[chosenColumnName].value >
                   b.attr[chosenColumnName].value))
      return 1 * modeFactor;
    else if (isPaginationDateTime(a.attr[chosenColumnName]) == true
             && isPaginationDateTime(b.attr[chosenColumnName]) == true
             && a.attr[chosenColumnName].type != 2
             && b.attr[chosenColumnName].type != 2
             && (a.attr[chosenColumnName].value <=
                   b.attr[chosenColumnName].value))
      return -1 * modeFactor;
    else if (isPaginationDateTime(a.attr[chosenColumnName]) == true
             && isPaginationDateTime(b.attr[chosenColumnName]) == true
             && a.attr[chosenColumnName].type == 2
             && b.attr[chosenColumnName].type == 2
             && (a.attr[chosenColumnName].value.toLocaleTimeString("ru-RU") >
                   b.attr[chosenColumnName].value.toLocaleTimeString("ru-RU")))
      return 1 * modeFactor;
    else if (isPaginationDateTime(a.attr[chosenColumnName]) == true
             && isPaginationDateTime(b.attr[chosenColumnName]) == true
             && a.attr[chosenColumnName].type == 2
             && b.attr[chosenColumnName].type == 2
             && (a.attr[chosenColumnName].value.toLocaleTimeString("ru-RU") <=
                   b.attr[chosenColumnName].value.toLocaleTimeString("ru-RU")))
      return -1 * modeFactor;
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
        this.activePaginationItems.sort((a, b) =>
        {
          return this.sortingCondition(a, b, 0);
        });
      else
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
        this.activePaginationItems.sort((a, b) =>
        {
          return this.sortingCondition(a, b, 0);
        });
      else
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

  public scrollTableRight(event: any): void
  {
    const elem: HTMLElement = (event.target.parentElement.parentElement
      .parentElement.getElementsByTagName("table")[0]
      .parentElement);
    elem.scrollLeft -= 50;
  }

  public scrollTableLeft(event: any): void
  {
    const elem: HTMLElement = (event.target.parentElement.parentElement
      .parentElement.getElementsByTagName("table")[0]
      .parentElement);
    elem.scrollLeft += 50;
  }

}
