import { InputType } from "../input/input-type";
import { ButtonMode } from "../button/button.component";

///////////////////////////////////////////////////////////////////////////////
////////////// Elements for pagination component configuration ////////////////
///////////////////////////////////////////////////////////////////////////////
/**
 * Main configuration interface that can be sent to the pagination component
 * It is recommended to create this interface through makePaginationConfig
 * function, this approach allows you to create PaginationConfig without
 * specifying all mandatory attributes
 */
export interface PaginationConfig {
  /**
   * Number of items that must be shown on one page
   */
  itemCntPerPage: number;
  /**
   * Number of pages (including first and last page)
   * that must be shown in the bottom part
   */
  visiblePagesCnt: number;
  /**
   * Text that will be displayed in case no suitable
   * items was found (after all filters implementation)
   */
  noSuitableItemsText?: string;
  /**
   * Text that will be displayed in case
   * no items have been sent to the component
   */
  noAnyItemsText?: string;

  // First column settings
  // The first column is created automatically with
  // firstColumnTitle setting as its title
  // and contains the values from 'text' attributes of PaginationItem objects
  // (in case viewType configuration of the component is Table)
  // ________________________________________________________________________
  /**
   * Setting to manipulate the first column displaying
   * true = first column will not be displayed
   * false or undefined = first column will be displayed
   */
  firstColumnOff?: boolean;
  /**
   * Title for the first table column
   */
  firstColumnTitle?: string;

  /**
   * List of column names that must be center-aligned
   */
  centerAlignedColumns: string[];

  filterIconPath: string;
  ascSortIconPath: string;
  descSortIconPath: string;

  /**
   * Chosen type of the pagination component displaying
   */
  viewType: PaginationViewType;
}

/**
 * Types of the pagination component displaying
 */
export enum PaginationViewType {
  List = 0,
  Tiles = 1,
  Table = 2
}

/**
 * Function which allows you to create PaginationConfig object without
 * specifying all mandatory attributes
 * If you don't specify some attribute it will be taken
 * from the defaults (inside the function)
 *
 * @param options    object with one or more PaginationConfig attributes which
 *                   user decided to specify by themself
 * @returns          completed PaginationConfig object with all attributes
 */
export function makePaginationConfig(options?: Partial<PaginationConfig>):
  PaginationConfig
{
  const defaults: PaginationConfig = {
    itemCntPerPage: 1,
    visiblePagesCnt: 5,
    noSuitableItemsText: "Подходящие объекты не найдены...",
    noAnyItemsText: "Объекты не найдены...",
    firstColumnOff: false,
    firstColumnTitle: "Название",
    centerAlignedColumns: [],
    filterIconPath: "",
    ascSortIconPath: "",
    descSortIconPath: "",
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
/**
 * Main interface to store data in the pagination component
 */
export interface PaginationItem {
  /**
   * Text on the button
   * (in case viewType configuration of the component is List or Tiles)
   * or value in the first column
   * (in case viewType configuration of the component is Table)
   */
  text: string;
  /**
   * Route to another web service resource that must be used
   * if an user will interact with this PaginationItem
   */
  route: string | null;
  /**
   * Settings of this PaginationItem for hidden filters
   */
  filterValues: PaginationFilterValuesItem[];
  /**
   * Settings of this PaginationItem for columns
   * (in case viewType configuration of the component is Table)
   */
  attr: {
    [key: string]: PaginationAttr;
  };
}

/**
 * Interface that determines the element's response
 * to one of the hidden filters
 */
export interface PaginationFilterValuesItem {
  /**
   * Id of some PaginationFilter that was sent to the pagination component
   */
  filterId: string;
  /**
   * Value that need to be used during the filtration
   */
  filterValue: any;
}

/**
 * Interface for the data of PaginationItem
 * that must be contained inside the table cells
 * (in case viewType configuration of the component is Table)
 */
export interface PaginationAttr {
  type: PaginationAttrType;
  body: any;
}

/**
 * Types of the PaginationAttr objects
 */
export enum PaginationAttrType {
  BOOLEAN = 0,
  NUMBER = 1,
  STRING = 2,
  ICON = 3,
  ICONS = 4,
  DATETIME = 5,
  DATE = 6,
  TIME = 7,
  BUTTON = 8
}

/**
 * Function for checking that PaginationAttr object is correct
 */
export function paginationAttrTypeChecker(attr: PaginationAttr): boolean
{
  if (attr.body == null || attr.body == undefined)
    return false;

  switch (attr.type) 
  {
    case PaginationAttrType.BOOLEAN:
      return typeof attr.body == "boolean";
      break;
    case PaginationAttrType.NUMBER:
      return typeof attr.body == "number";
      break;
    case PaginationAttrType.STRING:
      return typeof attr.body == "string";
      break;
    case PaginationAttrType.ICON:
      return (attr.body as PaginationIcon).priority !== undefined
          && typeof (attr.body as PaginationIcon).priority == "number"
          && (attr.body as PaginationIcon).src !== undefined
          && typeof (attr.body as PaginationIcon).src == "string";
      break;
    case PaginationAttrType.ICONS:
      return attr.body instanceof Array
             && attr.body.length > 0
             && attr.body.map((icon: any) =>
             {
               return (icon as PaginationIcon).priority !== undefined
                && typeof (icon as PaginationIcon).priority == "number"
                && (icon as PaginationIcon).src !== undefined
                && typeof (icon as PaginationIcon).src == "string";
             }).reduce((acc: boolean, cur: boolean) => acc && cur, true);
      break;
    case PaginationAttrType.BUTTON:
      return (attr.body as PaginationButton).priority !== undefined
          && typeof (attr.body as PaginationButton).priority == "number"
          && (attr.body as PaginationButton).labelText !== undefined
          && typeof (attr.body as PaginationButton).labelText == "string"
          && (attr.body as PaginationButton).clickFunc !== undefined
          && (attr.body as PaginationButton).clickFunc instanceof Function;
      break;
    case PaginationAttrType.DATETIME:
    case PaginationAttrType.DATE:
    case PaginationAttrType.TIME:
      return (attr.body as PaginationDateTime).value !== undefined
          && (attr.body as PaginationDateTime).value instanceof Date;
      break;
    default:
      return false;
  }
}

/**
 * Interface representing a type that can be specified among the 'attr'
 * attributes within a PaginationItem
 * Interface to work with custom icons in the cells of the pagination component
 * (in case viewType configuration of the component is Table)
 */
export interface PaginationIcon {
  /**
   * Value using within column sorting
   */
  priority: number;
  /**
   * Path to the image that must be used in the cell
   */
  src: string;
  /**
   * Flag to turn on / turn off the ping animation
   */
  animatePing: boolean;
  /**
   * Array to setup custom tailwind css classes
   * (mainly for weight and height setup)
   */
  cssClasses?: string[];
}

/**
 * Interface representing a type that can be specified among the 'attr'
 * attributes within a PaginationItem
 * Interface to work with buttons integrated into the pagination component
 */
export interface PaginationButton {
  /**
   * Value using within column sorting
   */
  priority: number;
  /**
   * Text on the button (in case imageSrc wasn't specified)
   */
  labelText: string;
  /**
   * Function that must be executed in case button was clicked
   */
  clickFunc: Function; // eslint-disable-line @typescript-eslint/ban-types
  /**
   * Path to the image that must be used inside the button
   */
  imageSrc?: string;
  /**
   * Value that defines the button is working or not
   */
  isEnabled?: boolean;
  /**
   * Button mode to decorate the button
   */
  mode?: ButtonMode;
  /**
   * Array to setup custom tailwind css classes
   */
  cssClasses?: string[];
}

/**
 * Interface representing a type that can be specified among the 'attr'
 * attributes within a PaginationItem
 * Interface for working with Date type and using it as Date, Time or Datetime
 * values in the cells of the pagination component
 * (in case viewType configuration of the component is Table)
 */
export interface PaginationDateTime {
  value: Date;
  /**
   * Custom Intl.DateTimeFormat object
   * for creating the string output
   */
  formatter?: Intl.DateTimeFormat;
  /**
   * Custom addition string at the end of the string output
   * (after a formatter implementation)
   */
  endStr?: string;
}

/**
 * Default Intl.DateTimeFormat objects for creating
 * the PaginationDateTime string output
 */
export const defaultDateTimeFormatters:
  Map<PaginationAttrType,Intl.DateTimeFormat> =
  new Map<PaginationAttrType,Intl.DateTimeFormat>(
    [
      [
        PaginationAttrType.DATETIME,
        new Intl.DateTimeFormat("ru-RU",
          {
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          })
      ],

      [
        PaginationAttrType.DATE,
        new Intl.DateTimeFormat("ru-RU",
          {
            year: "numeric",
            month: "numeric",
            day: "numeric"
          })
      ],

      [
        PaginationAttrType.TIME,
        new Intl.DateTimeFormat("ru-RU",
          {
            hour: "2-digit",
            minute: "2-digit"
          })
      ]
    ]);

///////////////////////////////////////////////////////////////////////////////
//////////////////// Elements for setting hidden filters //////////////////////
///////////////////////////////////////////////////////////////////////////////
/**
 * Main interface to setup a filter in the pagination component
 */
export interface PaginationFilter {
  /**
   * Unique attribute that allows one filter to be distinguished from another
   * Do not start id string with double underscores (__), this two symbols
   * are using for automatic filter generation inside the pagination component
   */
  id: string;
  /**
   * Text which user will see as the name the filter
   */
  labelText: string;
  /**
   * Settings for the input component
   */
  inputConfig: FilterInputConfig;
}

/**
 * Configuration interface with settings for the input component
 */
export interface FilterInputConfig {
  /**
   * Type of the input
   */
  type: InputType;
  /**
   * Any other attributes of the input component
   */
  [inputOption: string]: any;
}

///////////////////////////////////////////////////////////////////////////////
///// Supporting elements for the table form of the pagination component //////
///////////////////////////////////////////////////////////////////////////////
/**
 * Interface to store the columns in the pagination component
 */
export interface TableColumn {
  name: string;
  type: PaginationAttrType;
  alignCenter?: boolean;
}

/**
 * Interface to store the columns during the column sorting
 */
export interface SortTableColumn {
  column: TableColumn;
  mode: SortColumnMode;
}

/**
 * Modes for the column sorting
 */
export enum SortColumnMode {
  OFF = 0,
  ASC = 1,
  DESC = 2
}
