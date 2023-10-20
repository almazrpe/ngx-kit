import { InputType } from "../input/input-type";

///////////////////////////////////////////////////////////////////////////////
////////////// Elements for pagination component configuration ////////////////
///////////////////////////////////////////////////////////////////////////////
// Main configuration interface that can be sent to the pagination component
// It is recommended to create this interface through makeConfig function,
// this approach allows you to create PaginationConfig without specifying
// all mandatory attributes
export interface PaginationConfig {
  // Number of items that must be shown on one page
  itemCntPerPage: number;
  // Number of pages (including first and last page)
  // that must be shown in the bottom part
  visiblePagesCnt: number;
  // Text that will be displayed in case no suitable
  // items was found (after all filters implementation)
  noSuitableItemsText?: string;
  // Text that will be displayed in case
  // no items have been sent to the component
  noAnyItemsText?: string;

  // First column settings
  // The first column is created automatically with
  // firstColumnTitle setting as its title
  // and contains the values from 'text' attributes of PaginationItem objects
  // (in case viewType configuration of the component is Table)
  // ________________________________________________________________________
  // Setting to manipulate the first column displaying
  // true = first column will not be displayed
  // false or undefined = first column will be displayed
  firstColumnOff?: boolean;
  // Title for the first table column
  firstColumnTitle?: string;

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
    noSuitableItemsText: "Подходящие страницы не найдены...",
    noAnyItemsText: "Страницы не найдены...",
    firstColumnOff: false,
    firstColumnTitle: "Название",
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
  // (in case viewType configuration of the component is List or Tiles)
  // or value in the first column
  // (in case viewType configuration of the component is Table)
  text: string;
  // Route to another web service resource that must be used
  // if an user will interact with this PaginationItem
  route: string;
  // Settings of this PaginationItem for hidden filters
  filterValues: PaginationFilterValuesItem[];
  // Settings of this PaginationItem for columns
  // (in case viewType configuration of the component is Table)
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
// (in case viewType configuration of the component is Table)
export interface PaginationIcon {
  // Value using within column sorting
  priority: number;
  // Path to the image that must be used in the cell
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
// (in case viewType configuration of the component is Table)
export interface PaginationDateTime {
  value: Date;
  // Type of the PaginationDateTime object:
  // PaginationDateTimeMode.DATETIME or undefined = date & time
  // PaginationDateTimeMode.DATE = only date
  // PaginationDateTimeMode.TIME = only time
  type?: PaginationDateTimeMode;
  // Custom Intl.DateTimeFormat object
  // for creating the string output
  formatter?: Intl.DateTimeFormat;
  // Custom addition string at the end of the string output
  // (after a formatter implementation)
  endStr?: string;
}

// Types of the PaginationDateTime objects
export enum PaginationDateTimeMode {
  DATETIME = 0,
  DATE = 1,
  TIME = 2
}

// Default Intl.DateTimeFormat objects for creating
// the PaginationDateTime string output
export const defaultDateTimeFormatters:
  Record<PaginationDateTimeMode,Intl.DateTimeFormat> =
{
  [PaginationDateTimeMode.DATETIME]:
    new Intl.DateTimeFormat("ru-RU",
      {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }),

  [PaginationDateTimeMode.DATE]:
    new Intl.DateTimeFormat("ru-RU",
      {
        year: "numeric",
        month: "numeric",
        day: "numeric"
      }),

  [PaginationDateTimeMode.TIME]:
    new Intl.DateTimeFormat("ru-RU",
      {
        hour: "2-digit",
        minute: "2-digit"
      })
};

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
  // Unique attribute that allows one filter to be distinguished from another
  // Do not start id string with double underscores (__), this two symbols
  // are using for automatic filter generation inside the pagination component
  id: string;
  // Text which user will see as the name the filter
  labelText: string;
  // Settings for the input component
  inputConfig: FilterInputConfig;
}

// Configuration interface with settings for the input component
export interface FilterInputConfig {
  // Type of the input
  type: InputType;
  // Any other attributes of the input component
  [inputOption: string]: any;
}

///////////////////////////////////////////////////////////////////////////////
///// Supporting elements for the table form of the pagination component //////
///////////////////////////////////////////////////////////////////////////////
// Interface to store the columns in the pagination component
export interface TableColumn {
  labelText: string;
  type: string;
}

// Interface to store the columns during the column sorting
export interface SortTableColumn {
  column: TableColumn;
  mode: SortColumnMode;
}

// Modes for the column sorting
export enum SortColumnMode {
  OFF = 0,
  ASC = 1,
  DESC = 2
}
