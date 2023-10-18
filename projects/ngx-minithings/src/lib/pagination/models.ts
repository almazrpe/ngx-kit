import { InputType } from "../input/input-type";

export interface PaginationFilterValuesItem {
  filterId: string;
  filterValue: any;
}

export interface PaginationItem {
  text: string;
  route: string;
  filterValues: PaginationFilterValuesItem[];
  attr: {
    [key: string]: any;
  };
}

export interface FilterInputConfig {
  type: InputType;
  [inputOption: string]: any;
}

export interface PaginationFilter {
  id: string;
  labelText: string;
  inputConfig: FilterInputConfig;
}

export enum PaginationViewType {
  List = 0,
  Tiles = 1,
  Table = 2
}

export interface PaginationConfig {
  // Number of items that must be shown on one page
  itemCntPerPage: number;
  // Number of pages (including first and last page)
  // that must be shown in the bottom part
  visiblePagesCnt: number;
  // Title that will be displayed in case no suitable
  // items was found (after all filters implementation)
  noSuitableItemsTitle?: string;
  // Title that will be displayed in case
  // no items have been sent to the component
  noAnyItemsTitle?: string;

  viewType: PaginationViewType;
}

export function makeConfig(options?:Partial<PaginationConfig>): PaginationConfig
{
  const defaults = {
    itemCntPerPage: 1,
    visiblePagesCnt: 5,
    noSuitableItemsTitle: "Подходящие страницы не найдены...",
    noAnyItemsTitle: "Страницы не найдены...",
    viewType: PaginationViewType.Table
  };

  return {
    ...defaults,
    ...options,
  };
}

export interface TableColumn {
  labelText: string;
  type: string;
}

export interface PaginationIcon {
  priority: number;
  src: string;
  animatePing: boolean;
}

export const isPaginationIcon =
  (item: PaginationIcon | any): item is PaginationIcon =>
{
  return (item as PaginationIcon).priority !== undefined
          && (item as PaginationIcon).src !== undefined
}

export enum SortColumnMode {
  OFF = 0,
  ASC = 1,
  DESC = 2
}

export interface SortTableColumn {
  column: TableColumn;
  mode: SortColumnMode;
}
