import { InputType } from "../input/input-type";

export interface FilterValuesItem {
  filterId: string;
  filterValue: any;
}

export interface PaginationItem {
  text: string;
  route: string;
  filterValues: FilterValuesItem[];
  [tableValue: string]: any;
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
  viewType?: PaginationViewType;
}

export interface TableColumn {
  labelText: string;
  type: string;
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
