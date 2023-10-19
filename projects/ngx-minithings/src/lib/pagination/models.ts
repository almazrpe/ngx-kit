import { InputType } from "../input/input-type";

///////////////////////////////////////////////////////////////////////////////
////////////// Elements for pagination component configuration ////////////////
///////////////////////////////////////////////////////////////////////////////
// Main configuration interface that can be sent to the pagination component
// It is recommended to create this interface through makeConfig function
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

  // Chosen type of the pagination component displaying
  viewType: PaginationViewType;
}

// Types of the pagination component displaying
export enum PaginationViewType {
  List = 0,
  Tiles = 1,
  Table = 2
}

// Function which allows you to create PaginationConfig object without
// specifying all mandatory attributes
// If you don't specify some attribute it will be taken
// from the defaults (inside the function)
export function makeConfig(options?:Partial<PaginationConfig>):PaginationConfig
{
  const defaults: PaginationConfig = {
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

///////////////////////////////////////////////////////////////////////////////
/////////// Elements for setting values that need to be stored ////////////////
//////////////////// in the pagination component //////////////////////////////
///////////////////////////////////////////////////////////////////////////////
// Main interface to store data in the pagination component
export interface PaginationItem {
  // Text on the button
  // (in case PaginationViewType of the component is List or Tiles)
  // or value in the column "Название"
  // (in case PaginationViewType of the component is Table)
  text: string;
  // Route to another web service resource that need to be used
  // if some User interacts with this PaginationItem
  route: string;
  // Settings of this PaginationItem for hidden filters
  filterValues: PaginationFilterValuesItem[];
  // Settings of this PaginationItem for columns
  // (in case PaginationViewType of the component is Table)
  attr: {
    [key: string]: any;
  };
}

// Interface that determines the element's response
// to one of the hidden filters
export interface PaginationFilterValuesItem {
  // Id of some PaginationFilter that was sent to the pagination component
  filterId: string;
  // Value that need to be used during the filtration
  filterValue: any;
}

// Interface representing a type that can be specified among the 'attr'
// attributes within a PaginationItem
// Interface to work with custom icons in the cells of the pagination component
// (in case PaginationViewType of the component is Table)
export interface PaginationIcon {
  // Value defining the position of the PaginationItem
  // in case of column ordering
  priority: number;
  // Path to the image that must be used in a cell of the pagination component
  src: string;
  // Flag to turn on / turn off the ping animation
  animatePing: boolean;
}

// Custom type guard for PaginationIcon checking
export const isPaginationIcon: any =
  (item: PaginationIcon | any): item is PaginationIcon =>
  {
    return (item as PaginationIcon).priority !== undefined
          && (item as PaginationIcon).src !== undefined;
  };

// Interface representing a type that can be specified among the 'attr'
// attributes within a PaginationItem
// Interface for working with Date type and using it as Date, Time or Datetime
// values in the cells of the pagination component
// (in case PaginationViewType of the component is Table)
export interface PaginationDateTime {
  value: Date;
  // Type of the PaginationDateTime object:
  // 0 or undefined = date & time
  // 1 = only date
  // 2 = only time
  type?: 0 | 1 | 2;
  // Custom Intl.DateTimeFormat object
  // for creating a string output of this object
  formatter?: Intl.DateTimeFormat;
  // Custom addition string at the end of this object string output
  endStr?: string;
}

// Custom type guard for PaginationDateTime checking
export const isPaginationDateTime: any =
  (item: PaginationDateTime | any): item is PaginationDateTime =>
  {
    return (item as PaginationDateTime).value !== undefined
          && (item as PaginationDateTime).value instanceof Date;
  };

///////////////////////////////////////////////////////////////////////////////
//////////////////// Elements for setting hidden filters //////////////////////
///////////////////////////////////////////////////////////////////////////////
// Main interface to setup a filter in the pagination component
export interface PaginationFilter {
  id: string;
  labelText: string;
  inputConfig: FilterInputConfig;
}

// Configuration interface with settings for an input component
export interface FilterInputConfig {
  type: InputType;
  [inputOption: string]: any;
}

///////////////////////////////////////////////////////////////////////////////
///// Supporting elements for the table form of the pagination component //////
///////////////////////////////////////////////////////////////////////////////
export interface TableColumn {
  labelText: string;
  type: string;
}

export interface SortTableColumn {
  column: TableColumn;
  mode: SortColumnMode;
}

export enum SortColumnMode {
  OFF = 0,
  ASC = 1,
  DESC = 2
}
