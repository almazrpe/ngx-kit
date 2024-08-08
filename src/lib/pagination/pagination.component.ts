import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  AfterViewInit,
  Input
} from "@angular/core";
import { FormGroup, FormControl } from "@angular/forms";
import { Router } from "@angular/router";
import { BehaviorSubject, Observable, Subscription, of } from "rxjs";
import {
  PaginationItem,
  PaginationFilter,
  PaginationFilterTVPair,
  PaginationConfig,
  PaginationViewType,
  TableColumn,
  SortTableColumn,
  SortColumnMode,
  defaultDateTimeFormatters,
  PaginationIcon,
  PaginationLabel,
  PaginationSortFunc,
  PaginationColumnTag,
  PaginationAttr,
  PaginationAttrType,
  paginationAttrTypeChecker,
  makeTableColumnSettings,
  PaginationPart,
  makePaginationConfig
} from "./models";
import { DTUtils } from "../dt/utils";
import { InputType } from "../input/input-type";
import { ButtonMode } from "../button/button.component";
import { StatusCircleMode } from "../status-circle/status-circle.component";

const DEFAULT_FIRST_COLUMN_NAME: string = "###NAME###";

@Component({
  selector: "ngx-kit-pagination",
  templateUrl: "./pagination.component.html",
  styleUrls: []
})
export class PaginationComponent implements OnInit, AfterViewInit, OnDestroy
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
  @Input() public config: Partial<PaginationConfig> = {};
  /**
   * Observable which indicates some part of the component must be updated
   */
  @Input() public updateEvent: Observable<PaginationPart | null> | undefined =
    of(null);

  /**
   * Map object with custom sorting functions (compare-like)
   * for sorting columns of the component
   * (in case viewType configuration of the component is Table)
   * The keys of the Map object are names of table columns
   * The values of the Map object are functions
   */
  @Input() public customColumnSortingFunctions:
    Map<string, PaginationSortFunc> | undefined =
      new Map<string, PaginationSortFunc>();

  // Lists of items and filters that are active and on the screen
  public allPaginationItems$: BehaviorSubject<PaginationItem[]> =
    new BehaviorSubject<PaginationItem[]>([]);
  public activePaginationItems$: BehaviorSubject<PaginationItem[]> =
    new BehaviorSubject<PaginationItem[]>([]);
  public activePaginationFilters$: BehaviorSubject<PaginationFilter[]> =
    new BehaviorSubject<PaginationFilter[]>([]);
  public disabledPaginationFilters$: BehaviorSubject<PaginationFilter[]> =
    new BehaviorSubject<PaginationFilter[]>([]);
  public config$: BehaviorSubject<PaginationConfig> =
    new BehaviorSubject<PaginationConfig>(makePaginationConfig());

  // Imported modules, interfaces and etc for html
  public MathModule: any = Math;
  public BtnMode: any = ButtonMode;
  public CircleMode: any = StatusCircleMode;
  public PagViewType: any = PaginationViewType;
  public InpType: any = InputType;
  public SortColMode: any = SortColumnMode;
  public defaultDTFormatters: any = defaultDateTimeFormatters;
  public PagAttrType: any = PaginationAttrType;
  public PagColTag: any = PaginationColumnTag;
  public PagPart: any = PaginationPart;

  public pageCnt: number;
  public curPage: number = 0;
  public leftSlice: number = 0;

  public isFiltersWindowShown: boolean = false;
  public filtersFormGroup: FormGroup = new FormGroup({});
  private curFilterValues: Map<number, PaginationFilterTVPair> =
    new Map<number, PaginationFilterTVPair>();
  private fullTextSearchValue: string | null = null;

  public tableColumns: TableColumn[] = [];
  public sortChosenColumns: SortTableColumn[] = [];

  public isTableOverflowing: boolean = false;
  private tableScrollingSpeed: number = 50;

  private updateEventSubscription: Subscription;

  @ViewChild("tableRef") public tableRef: ElementRef;
  @ViewChild("tableBodyRef") public tableBodyRef: ElementRef;

  public constructor(
    private router: Router,
  ) {}

  public ngOnInit(): void
  {
    this.config$.next(makePaginationConfig(this.config));

    if (this.config$.value.firstColumnOff == false)
      this.tableColumns.push({
        ...makeTableColumnSettings(),
        name: DEFAULT_FIRST_COLUMN_NAME,
        header: PaginationColumnTag.NoHeader,
      });

    this.paginationItems.forEach(
      (item: PaginationItem, index: number) =>
      {
        for (const key in item.attr)
        {
          if (
            item.attr[key] == null
            || item.attr[key] == undefined
            || paginationAttrTypeChecker(item.attr[key]) == false
          )
            continue;
          else
            if (undefined == this.tableColumns.find(
              (column: TableColumn) =>
              {
                return column.name == key
                       && column.type == item.attr[key].type;
              }
            ))
            {
              this.config$.value;
              this.tableColumns.push({
                ...makeTableColumnSettings(
                  this.config$.value.columnTags.get(key)
                ),
                name: key,
                type: item.attr[key].type,
              });
            }
        }

        if (this.config$.value.firstColumnOff == false)
          this.paginationItems[index].attr[DEFAULT_FIRST_COLUMN_NAME] = {
            type: PaginationAttrType.STRING,
            body: item.text
          };
      }
    );
    this.allPaginationItems$.next(
      this.config$.value.reverseItems == true
        ? this.paginationItems.concat().reverse()
        : this.paginationItems.concat()
    );
    this.activePaginationItems$.next(this.allPaginationItems$.value);
    this.disabledPaginationFilters$.next(this.paginationFilters.concat());
    for (const filter of this.paginationFilters)
    {
      this.filtersFormGroup.addControl(
        String(filter.id),
        new FormControl(null)
      );
    }
    this.refreshPageCnt();

    if (this.updateEvent !== undefined)
      this.updateEventSubscription = this.updateEvent.subscribe({
        next: (part: PaginationPart | null) =>
        {
          switch(part)
          {
            case PaginationPart.Config:
              this.config$.next(
                makePaginationConfig(this.config)
              );
              break;
            case PaginationPart.Items:
              if (this.config$.value.disabledParts.has(PaginationPart.Items))
              {
                const conf: PaginationConfig = this.config$.value;
                conf.disabledParts.delete(PaginationPart.Items);
                this.config$.next(conf);
              }

              setTimeout(() =>
              {
                if (this.config$.value.firstColumnOff == false)
                {
                  for (let i in this.paginationItems)
                  {
                    this.paginationItems[i].attr[DEFAULT_FIRST_COLUMN_NAME] =
                    {
                      type: PaginationAttrType.STRING,
                      body: this.paginationItems[i].text
                    };
                  }
                }

                this.allPaginationItems$.next(
                  this.config$.value.reverseItems == true
                    ? this.paginationItems.concat().reverse()
                    : this.paginationItems.concat()
                );
                this.refreshPages();
              }, 100);
              break;
            case PaginationPart.Filters:
              if (this.config$.value.disabledParts.has(
                PaginationPart.Filters
              ))
              {
                const conf: PaginationConfig = this.config$.value;
                conf.disabledParts.delete(PaginationPart.Filters);
                this.config$.next(conf);
              }

              this.disabledPaginationFilters$.next(
                this.paginationFilters.concat()
              );
              this.filtersFormGroup = new FormGroup({});
              for (const filter of this.paginationFilters)
              {
                this.filtersFormGroup.addControl(
                  String(filter.id),
                  new FormControl(null)
                );
              }
              this.activePaginationFilters$.next([]);
              this.curFilterValues.clear();
              this.isFiltersWindowShown = false;
              this.refreshPages();
              break;
            case PaginationPart.SearchField:
            case PaginationPart.FirstHr:
            case PaginationPart.SecondHr:
            case PaginationPart.Footer:
              this.updateVisualPart(part);
              break;
            default:
              break;
          }
        }
      });
  }

  public itemHasAttr(item: PaginationItem, attrName: string): boolean
  {
    return Object.prototype.hasOwnProperty.call(item.attr, attrName);
  }

  public ngAfterViewInit(): void
  {
    if (this.config$.value.tableFixedHeight != null)
    {
      this.tableRef.nativeElement.style.height =
        this.config$.value.tableFixedHeight;
    }

    if (this.config$.value.tbodyFixedHeight != null)
    {
      this.tableBodyRef.nativeElement.style.height =
        this.config$.value.tbodyFixedHeight;
    }
  }

  public setRowFixedHeight(cellRef: HTMLDivElement): void
  {
    if (this.config$.value.rowFixedHeight != null)
    {
      cellRef.style.height = this.config$.value.rowFixedHeight;
    }
  }

  public setTextCellStyles(column: TableColumn): string[]
  {
    switch(this.config$.value.rowsLineClamp)
    {
      case 1:
        return ["line-clamp-1"].concat([column.wordBreakClass]);
      case 2:
        return ["line-clamp-2"].concat([column.wordBreakClass]);
      case 3:
        return ["line-clamp-3"].concat([column.wordBreakClass]);
      case 4:
        return ["line-clamp-4"].concat([column.wordBreakClass]);
      case 5:
        return ["line-clamp-5"].concat([column.wordBreakClass]);
      case 6:
        return ["line-clamp-6"].concat([column.wordBreakClass]);
      default:
        return [column.wordBreakClass];
    }
  }

  public setColumnFixedWidth(
    colRef: HTMLTableColElement,
    colObj: TableColumn
  ): void
  {
    const colWidth: string | undefined =
      this.config$.value.columnFixedWidths.get(colObj.name);

    if (colWidth !== undefined)
      colRef.style.width = colWidth;
  }

  public ngOnDestroy(): void 
  {
    this.updateEventSubscription?.unsubscribe();
  }

  public getFilterFormControl(id: number): FormControl
  {
    return this.filtersFormGroup.get(String(id)) as FormControl;
  }

  private updateVisualPart(
    part: PaginationPart.SearchField
      | PaginationPart.FirstHr
      | PaginationPart.SecondHr
      | PaginationPart.Footer
  ): void
  {
    const conf: PaginationConfig = this.config$.value;
    if (conf.disabledParts.has(part))
      conf.disabledParts.delete(part);
    else
      conf.disabledParts.add(part);
    this.config$.next(conf);
  }

  private refreshPageCnt(): void
  {
    const itemCntPerPage: number = this.config$.value.itemCntPerPage > 0
      ? this.config$.value.itemCntPerPage
      : 1;

    this.pageCnt = this.activePaginationItems$.value.length > 1
      ? Math.ceil(
        this.activePaginationItems$.value.length / itemCntPerPage
      )
      : 1;

    if (this.config$.value.addEmptyItemsOnLastPage == true)
    {
      const newPagItems: Array<PaginationItem> = new Array<PaginationItem>(
        itemCntPerPage - (
          this.activePaginationItems$.value.length - (
            (this.pageCnt - 1) * itemCntPerPage
          )
        )
      );

      for (let i = 0; i < newPagItems.length; i += 1)
      {
        newPagItems[i] = {
          text: "",
          route: null,
          filterValues: null,
          attr: {},
          dummy: true
        };
      }

      this.activePaginationItems$.next(
        this.activePaginationItems$.value.concat(newPagItems)
      );
    }
  }

  public getNextPage(): void
  {
    this.curPage+=1;
    if (this.curPage >= this.config$.value.visiblePagesCnt - 2)
    {
      this.leftSlice+=1;
      if (this.leftSlice > this.pageCnt - this.config$.value.visiblePagesCnt)
        this.leftSlice = this.pageCnt - this.config$.value.visiblePagesCnt;
    }
  }

  public getPreviousPage(): void
  {
    this.curPage-=1;
    if (this.curPage < this.pageCnt - this.config$.value.visiblePagesCnt + 2)
    {
      this.leftSlice-=1;
      if (this.leftSlice < 0)
        this.leftSlice = 0;
    }
  }

  public getPage(pageNum: number): void
  {
    this.curPage = pageNum;
    this.leftSlice = this.curPage - this.config$.value.visiblePagesCnt + 3;
    if (this.leftSlice > this.pageCnt - this.config$.value.visiblePagesCnt)
      this.leftSlice = this.pageCnt - this.config$.value.visiblePagesCnt;
    else if (this.leftSlice < 0)
      this.leftSlice = 0;
  }

  public toggleFiltersWindow(): void
  {
    this.isFiltersWindowShown = !this.isFiltersWindowShown;
  }

  public dropFilter(filterId: number): void
  {
    const filter: PaginationFilter | undefined =
      this.paginationFilters.find(filter=>
      {
        return filter.id == filterId;
      });

    if (filter != undefined)
      this.disabledPaginationFilters$.next(
        this.disabledPaginationFilters$.value.concat([filter])
      );

    this.activePaginationFilters$.next(
      this.activePaginationFilters$.value.filter(f =>
      {
        return f.id !== filterId;
      })
    );

    this.filtersFormGroup.patchValue({
      [String(filterId)]: null
    });
    this.curFilterValues.delete(filterId);
    this.refreshPages();
  }

  public addFilter(filterId: number): void
  {
    for (const filter of this.activePaginationFilters$.value)
    {
      if (filter.id == filterId)
        return;
    }

    this.disabledPaginationFilters$.next(
      this.disabledPaginationFilters$.value.filter(filter =>
      {
        if (filter.id == filterId)
        {
          this.activePaginationFilters$.next(
            this.activePaginationFilters$.value.concat([filter])
          );
          return false;
        }
        else
          return true;
      })
    );

    this.isFiltersWindowShown = true;
  }

  public filterChange(
    filterId: number,
    pair: PaginationFilterTVPair
  ): void
  {
    if (pair.value == null)
      this.curFilterValues.delete(filterId);
    else
    {
      switch(pair.type)
      {
        case InputType.Date:
          this.curFilterValues.set(
            filterId,
            {
              type: pair.type,
              value: DTUtils.getComparativeDateString(pair.value)
            }
          );
          break;
        case InputType.DateRange:
          this.curFilterValues.set(
            filterId,
            {
              type: pair.type,
              value: [
                DTUtils.getComparativeDateString(pair.value[0]),
                DTUtils.getComparativeDateString(pair.value[1])
              ]
            }
          );
          break;
        default:
          this.curFilterValues.set(filterId, pair);
          break;
      }
    }
    this.refreshPages();
    this.curPage = 0;
    this.leftSlice = 0;
  }

  public setFullTextSearchVal(value: string | null): void
  {
    this.fullTextSearchValue =
      value == null || value.length == 0
        ? null
        : value;
    this.refreshPages();
    this.curPage = 0;
    this.leftSlice = 0;
  }

  private refreshPages(): void
  {
    this.sortChosenColumns = [];

    this.activePaginationItems$.next(
      this.allPaginationItems$.value.filter(item =>
      {
        if (this.curFilterValues.size == 0) {}
        else if (item.filterValues === null)
          return false;
        else
        {
          for (const fid of this.curFilterValues.keys())
          {
            const fIVal: any = item.filterValues.get(fid);
            if (fIVal === undefined)
              return false;
            else
            {
              const curFilterPair: PaginationFilterTVPair =
                this.curFilterValues.get(fid) ?? {type: null, value: null};
              switch(curFilterPair.type)
              {
                case null:
                  break;
                case InputType.Date:
                  if (curFilterPair.value !== fIVal)
                    return false;
                  break;
                case InputType.DateRange:
                  if (fIVal < curFilterPair.value[0])
                    return false;
                  if (fIVal > curFilterPair.value[1])
                    return false;
                  break;
                default:
                  if (fIVal != curFilterPair.value
                      && !String(fIVal).toLowerCase().includes(
                        String(curFilterPair.value).toLowerCase()))
                    return false;
                  break;
              }
            }
          }
        }

        if (this.fullTextSearchValue != null)
        {
          for (const column of this.tableColumns)
          {
            for (const key in item.attr)
            {
              if (key == column.name)
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
                    attrStr = String(item.attr[key].body);
                }

                if (attrStr.toLowerCase().includes(
                  this.fullTextSearchValue.toLowerCase())
                )
                {
                  return true;
                }
              }
            }
          }
          return false;
        }

        return true;
      })
    );

    this.refreshPageCnt();
  }

  public useRouteOrFunction (item: PaginationItem): void
  {
    if (item.altClickFunc != undefined)
    {
      if (item.route != null)
        item.altClickFunc(item.route);
      else
        item.altClickFunc(item);
    }
    else
    {
      if (item.route != null)
        this.router.navigate([item.route]);
    }
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

    if (this.customColumnSortingFunctions?.has(chosenColumnName) ?? false)
    {
      const func: PaginationSortFunc | undefined =
        this.customColumnSortingFunctions!.get(chosenColumnName);

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
          case PaginationAttrType.LABEL:
          case PaginationAttrType.ICON: {
            if (aAttr!.body.priority == bAttr!.body.priority)
              return this.sortingCondition(a, b, iter + 1);
            else if (aAttr!.body.priority > bAttr!.body.priority)
              return 1 * modeFactor;
            else
              return -1 * modeFactor;
            break;
          }
          case PaginationAttrType.LABELS:
          case PaginationAttrType.ICONS: {
            if (modeFactor > 0)
            {
              const aBest: number = Math.max(...aAttr!.body.map(
                (item: PaginationIcon | PaginationLabel): number =>
                  item.priority
              ));
              const bBest: number = Math.max(...bAttr!.body.map(
                (item: PaginationIcon | PaginationLabel): number =>
                  item.priority
              ));
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
                (item: PaginationIcon | PaginationLabel): number =>
                  item.priority
              ));
              const bWorst: number = Math.min(...bAttr!.body.map(
                (item: PaginationIcon | PaginationLabel): number =>
                  item.priority
              ));
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
            if (aAttr!.body.value.toString() == bAttr!.body.value.toString())
              return this.sortingCondition(a, b, iter + 1);
            else if (aAttr!.body.value > bAttr!.body.value)
              return 1 * modeFactor;
            else
              return -1 * modeFactor;
            break;
          }
          case PaginationAttrType.DATE: {
            if (
              aAttr!.body.value.toDateString()
                == aAttr!.body.value.toDateString()
            )
              return this.sortingCondition(a, b, iter + 1);
            else if (
              new Date(aAttr!.body.value.toDateString())
                > new Date(bAttr!.body.value.toDateString())
            )
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
      {
        const items: PaginationItem[] =
          this.activePaginationItems$.value.concat();
        items.sort((a, b) =>
        {
          return this.sortingCondition(a, b, 0);
        });
        this.activePaginationItems$.next(items);
      }
      else 
      {
        this.refreshPages();
      }
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
      {
        const items: PaginationItem[] =
          this.activePaginationItems$.value.concat();
        items.sort((a, b) =>
        {
          return this.sortingCondition(a, b, 0);
        });
        this.activePaginationItems$.next(items);
      }
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

  public whiteRowCheck(itemInd: number, config: PaginationConfig): boolean
  {
    if (config.itemCntPerPage % 2 == 0 || this.curPage % 2 == 0)
      return itemInd % 2 == 1;
    else
      return itemInd % 2 == 0;
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
