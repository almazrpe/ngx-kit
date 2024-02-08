import { Component, OnInit, Input } from "@angular/core";
import { Router } from "@angular/router";
import {
  PaginationItem,
  PaginationFilter,
  PaginationConfig,
  PaginationViewType,
  TableColumn,
  SortTableColumn,
  SortColumnMode,
  defaultDateTimeFormatters,
  PaginationIcon,
  PaginationAttr,
  PaginationAttrType,
  paginationAttrTypeChecker,
  makePaginationConfig

} from "./models";
import { InputType } from "../input/input-type";
import { ButtonMode } from "../button/button.component";
import { StatusCircleMode } from "../status-circle/status-circle.component";

@Component({
  selector: "ngx-kit-pagination",
  templateUrl: "./pagination.component.html",
  styleUrls: []
})
export class PaginationComponent implements OnInit
{
  /**
   * List of items for the pagination
   */
  @Input() public paginationItems: PaginationItem[] = [];
  /**
   * List of available filters for the pagination
   */
  @Input() public paginationFilters: PaginationFilter[] = [];
  /**
   * Configuration object for the pagination
   */
  @Input() public config: PaginationConfig = makePaginationConfig();

  /**
   * Map object with custom sorting functions (compare-like)
   * for sorting columns of the component
   * (in case viewType configuration of the component is Table)
   * The keys of the Map object are names of table columns
   * The values of the Map object are functions
   * that must be used to sort this columns
   * Your custom function should receive 3 arguments:
   * a (of your expected type),
   * b (of your expected type), and
   * modeFactor (1 or -1) that will tell your
   * function is that ASC or DESC sorting
   * Your function must return a number
   */
  /* eslint-disable @typescript-eslint/ban-types */
  @Input() public customColumnSortingFunctions: Map<string, Function> =
    new Map<string, Function>([]);
  /* eslint-enable */

  // Lists of items and filters that are active and on the screen
  public activePaginationItems: PaginationItem[] = [];
  public activePaginationFilters: PaginationFilter[] = [];
  public disabledPaginationFilters: PaginationFilter[] = [];

  // Imported modules, interfaces and etc for html
  public MathModule: any = Math;
  public BtnMode: any = ButtonMode;
  public CircleMode: any = StatusCircleMode;
  public PagViewType: any = PaginationViewType;
  public InpType: any = InputType;
  public SortColMode: any = SortColumnMode;
  public defaultDTFormatters: any = defaultDateTimeFormatters;
  public PagAttrType: any = PaginationAttrType;

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
  private tableScrollingSpeed: number = 50;

  public constructor(
    private router: Router,
  ) {}

  public ngOnInit(): void
  {
    if (this.config.firstColumnOff == undefined
        || this.config.firstColumnOff == false)
      this.tableColumns.push({
        name: this.config.firstColumnTitle ?? "Название",
        type: PaginationAttrType.STRING
      });

    this.paginationItems.forEach((item: PaginationItem, index: number) =>
    {
      for (const key in item.attr)
      {
        if (item.attr[key] == null
            || item.attr[key] == undefined
            || paginationAttrTypeChecker(item.attr[key]) == false)
          continue;
        else
          if (undefined == this.tableColumns.find(column =>
          {
            return column.name == key
                   && column.type == item.attr[key].type;
          }))
          {
            this.tableColumns.push({
              name: key,
              type: item.attr[key].type,
              alignCenter: this.config.centerAlignedColumns.includes(key)
            });
          }
      }

      if (this.config.firstColumnOff == undefined
          || this.config.firstColumnOff == false)
        (this.paginationItems[index]
          .attr[this.config.firstColumnTitle ?? "Название"]) =
        {
          type: PaginationAttrType.STRING,
          body: item.text
        };
    });
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
          if (this.config.firstColumnOff == undefined
              || this.config.firstColumnOff == false)
            (this.paginationItems[index]
              .attr[this.config.firstColumnTitle ?? "Название"]) =
            {
              type: PaginationAttrType.STRING,
              body: item.text
            };
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
    if (value == null || value.length == 0)
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
        this.curFilterValues.set("__" + column.name, value);
      });
    }
    this.refreshPages();
    this.curPage = 0;
    this.leftSlice = 0;
  }

  public filterChange(filterId: string, value: any): void
  {
    value = value ?? "";
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
              if (key == fid.slice(2))
              {
                let attrStr: string;
                switch(item.attr[key].type)
                {
                  case PaginationAttrType.DATETIME:
                    attrStr = defaultDateTimeFormatters.get(
                      PaginationAttrType.DATETIME)!.format(
                        item.attr[key].body.value);
                    break;
                  case PaginationAttrType.DATE:
                    attrStr = defaultDateTimeFormatters.get(
                      PaginationAttrType.DATE)!.format(
                        item.attr[key].body.value);
                    break;
                  case PaginationAttrType.TIME:
                    attrStr = defaultDateTimeFormatters.get(
                      PaginationAttrType.TIME)!.format(
                        item.attr[key].body.value);
                    break;
                  default:
                    attrStr = String(item.attr[key].body).toLowerCase();
                }

                if (attrStr.includes(
                  String(this.curFilterValues.get(fid)).toLowerCase()))
                  isColumnFilterApproved = true;
              }
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

  public goLink(route: string | null): void
  {
    if (route != null)
      this.router.navigate([route]);
  }

  private sortingCondition(a: PaginationItem,
    b: PaginationItem,
    iter: number): number
  {
    if (iter < 0 || iter >= this.sortChosenColumns.length)
      return 0;

    const chosenColumnName: string =
      this.sortChosenColumns[iter].column.name;
    const chosenColumnType: PaginationAttrType =
      this.sortChosenColumns[iter].column.type;
    const modeFactor: number = this.sortChosenColumns[iter].mode +
      Math.floor(this.sortChosenColumns[iter].mode / 2) * -3;

    const aAttr: PaginationAttr | undefined = a.attr[chosenColumnName];
    const bAttr: PaginationAttr | undefined = b.attr[chosenColumnName];

    if (this.customColumnSortingFunctions.has(chosenColumnName))
    {
      /* eslint-disable @typescript-eslint/ban-types */
      const func: Function | undefined =
        this.customColumnSortingFunctions.get(chosenColumnName);
      /* eslint-enable */

      let res: number | undefined = undefined;
      try
      {
        res = func == undefined
          ? undefined
          : func(aAttr, bAttr, modeFactor);
      }
      catch (error: any)
      {
        console.log(error);
        console.log("Custom column sort function for " +
                    `the column '${chosenColumnName}' doesn't work!`);
      }

      if (res == undefined || typeof res != "number")
      {
        console.log("Custom column sort function for " +
                    `the column '${chosenColumnName}' doesn't work!`);
        return this.sortingCondition(a, b, iter + 1);
      }
      else if (res == 0)
        return this.sortingCondition(a, b, iter + 1);
      else
        return res;
    }
    else if (aAttr == undefined && bAttr == undefined)
      return this.sortingCondition(a, b, iter + 1);
    else if (aAttr != undefined && bAttr == undefined)
      return (modeFactor == 1
        ? -1 * modeFactor
        : 1 * modeFactor);
    else if (aAttr == undefined && bAttr != undefined)
      return (modeFactor == 1
        ? 1 * modeFactor
        : -1 * modeFactor);
    else
    {
      const aCheck: boolean = paginationAttrTypeChecker(aAttr!);
      const bCheck: boolean = paginationAttrTypeChecker(bAttr!);
      if (aCheck == false && bCheck == false
          || aAttr!.type != chosenColumnType
             && bAttr!.type != chosenColumnType)
        return this.sortingCondition(a, b, iter + 1);
      else if (bCheck == false
               || aAttr!.type == chosenColumnType
                  && bAttr!.type != chosenColumnType)
        return (modeFactor == 1
          ? -1 * modeFactor
          : 1 * modeFactor);
      else if (aCheck == false
               || aAttr!.type != chosenColumnType
                  && bAttr!.type == chosenColumnType)
        return (modeFactor == 1
          ? 1 * modeFactor
          : -1 * modeFactor);
      else
      {
        switch(chosenColumnType)
        {
          case PaginationAttrType.BUTTON:
          case PaginationAttrType.ICON: {
            if (aAttr!.body.priority == bAttr!.body.priority)
              return this.sortingCondition(a, b, iter + 1);
            else if (aAttr!.body.priority > bAttr!.body.priority)
              return 1 * modeFactor;
            else
              return -1 * modeFactor;
            break;
          }
          case PaginationAttrType.ICONS: {
            if (modeFactor > 0)
            {
              const aBest: number = Math.max(...aAttr!.body.map(
                (item: PaginationIcon): number => item.priority));
              const bBest: number = Math.max(...bAttr!.body.map(
                (item: PaginationIcon): number => item.priority));
              if (aBest == bBest)
                return this.sortingCondition(a, b, iter + 1);
              else if (aBest > bBest)
                return 1;
              else
                return -1;
            }
            else
            {
              const aWorst: number = Math.min(...aAttr!.body.map(
                (item: PaginationIcon): number => item.priority));
              const bWorst: number = Math.min(...bAttr!.body.map(
                (item: PaginationIcon): number => item.priority));
              if (aWorst == bWorst)
                return this.sortingCondition(a, b, iter + 1);
              else if (aWorst < bWorst)
                return 1;
              else
                return -1;
            }
            break;
          }
          case PaginationAttrType.DATETIME: {
            if (aAttr!.body.value == bAttr!.body.value)
              return this.sortingCondition(a, b, iter + 1);
            else if (aAttr!.body.value > bAttr!.body.value)
              return 1 * modeFactor;
            else
              return -1 * modeFactor;
            break;
          }
          case PaginationAttrType.DATE: {
            const aDate: Date = new Date(aAttr!.body.value.toDateString());
            const bDate: Date = new Date(bAttr!.body.value.toDateString());
            if (aDate == bDate)
              return this.sortingCondition(a, b, iter + 1);
            else if (aDate > bDate)
              return 1 * modeFactor;
            else
              return -1 * modeFactor;
            break;
          }
          case PaginationAttrType.TIME: {
            const aTime: string = aAttr!.body.value.toTimeString();
            const bTime: string = aAttr!.body.value.toTimeString();
            if (aTime == bTime)
              return this.sortingCondition(a, b, iter + 1);
            else if (aTime > bTime)
              return 1 * modeFactor;
            else
              return -1 * modeFactor;
            break;
          }
          case PaginationAttrType.BOOLEAN: {
            if (aAttr!.body == bAttr!.body)
              return this.sortingCondition(a, b, iter + 1);
            else if (bAttr!.body == true)
              return 1 * modeFactor;
            else
              return -1 * modeFactor;
            break;
          }
          default: {
            if (aAttr!.body == bAttr!.body)
              return this.sortingCondition(a, b, iter + 1);
            else if (aAttr!.body > bAttr!.body)
              return 1 * modeFactor;
            else
              return -1 * modeFactor;
          }
        }
      }
    }
  }

  public sortPaginationItems(chosenColumn: TableColumn, event: any): void
  {
    if (event.shiftKey == false)
    {
      const oldSortColumn: SortTableColumn | undefined =
        this.sortChosenColumns.find(scolumn =>
          scolumn.column.name == chosenColumn.name);

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
          return scolumn.column.name == chosenColumn.name;
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
        scolumn.column.name == column.name);

    return sortColumn == undefined ? false : modes.includes(sortColumn.mode);
  }

  public scrollTableRight(event: any): void
  {
    const elem: HTMLElement = (event.target.parentElement.parentElement
      .parentElement.getElementsByTagName("table")[0]
      .parentElement);
    elem.scrollLeft -= this.tableScrollingSpeed;
  }

  public scrollTableLeft(event: any): void
  {
    const elem: HTMLElement = (event.target.parentElement.parentElement
      .parentElement.getElementsByTagName("table")[0]
      .parentElement);
    elem.scrollLeft += this.tableScrollingSpeed;
  }
}
