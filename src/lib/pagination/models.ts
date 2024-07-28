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
   * Chosen type of the pagination component displaying
   */
  viewType: PaginationViewType;
  /**
   * The first column is created automatically with
   * DEFAULT_FIRST_COLUMN_NAME (constant in the component) as its title
   * and contains the values from 'text' attributes of PaginationItem objects
   * (in case viewType configuration of the component is Table)
   * This setting is used for manipulation the first column displaying
   * true = first column will not be displayed (RECOMMENDED)
   * false or undefined = first column will be displayed (DEFAULT)
   */
  firstColumnOff: boolean;
  /**
   * Flag indicating pagination items must be displayed in reversed order
   */
  reverseItems: boolean;
  /**
   * Number of items that must be shown on one page
   */
  addEmptyItemsOnLastPage: boolean;
  /**
   * Number of items that must be shown on one page
   */
  itemCntPerPage: number;
  /**
   * Number of pages (including first and last page)
   * that must be shown in the bottom part
   */
  visiblePagesCnt: number;

  rowsLineClamp: 1 | 2 | 3 | 4 | 5 | 6 | null;
  /**
   * Parts of the pagination component that must be disabled
   * PaginationPart.Config doesn't work,
   * PaginationPart.Filters and PaginationPart.Items could be set initially,
   * but after a first update their view will be determined by the count of
   * filters and pagination items int the component
   * OTHERS - could be set initially and after every update they change
   * their disabled status
   */
  disabledParts: Set<PaginationPart>;
  /**
   * Height parameter that must be specified as a style.height
   * for the rows of the table
   * NULL (default value) means the height depends on content of
   * the specific row, and
   * NOT NULL will make height of all rows the same
   * (in case viewType configuration of the component is Table)
   */
  rowFixedHeight: string | null;
  /////////////////////////////////////////////////////////////
  // Not dynamic (using only once on initialisation stage)
  /////////////////////////////////////////////////////////////
  /**
   * Height parameter that must be specified as a style.height
   * for the table
   * NULL (default value) means the height depends on content, and
   * NOT NULL will make fixed the height of the table and prevent any
   * footer unsanctioned moves but will create a risk of vertical overflowing
   * (in case viewType configuration of the component is Table)
   */
  tableFixedHeight: string | null;
  /**
   * Height parameter that must be specified as a style.height
   * for the <tbody> element of the table
   * NULL (default value) means the height depends on content, and
   * NOT NULL will make fixed the height of the <tbody> and all
   * rows of the table will stretch trying to fill all specified height
   * (in case viewType configuration of the component is Table)
   */
  tbodyFixedHeight: string | null;
  /**
   * Width parameters for specific columns
   * keys are column names, and
   * values are strings that must be specified as a style.width
   * (in case viewType configuration of the component is Table)
   */
  columnFixedWidths: Map<string,string>;
  /**
   * Column tags determining column behaviour and view
   * keys are column names, and
   * values are sets of PaginationColumnTag-s
   * (in case viewType configuration of the component is Table)
   */
  columnTags: Map<string,Set<PaginationColumnTag>>;
  /////////////////////////////////////////////////////////////
  // Text strings and translations
  /////////////////////////////////////////////////////////////
  /**
   * Text that will be displayed in case no suitable
   * items was found (after all filters implementation)
   */
  noSuitableItemsTxt: string;
  /**
   * Text that will be displayed in case
   * no items have been sent to the component
   */
  noAnyItemsTxt: string;
  /**
   * Text that will be displayed in case
   * items view was disabled (using disabledParts configuration)
   */
  hiddenItemsTxt: string;
  /**
   * Text of button "back" in the footer
   */
  backTxt: string;
  /**
   * Text of button "forward" in the footer
   */
  forwardTxt: string;
  /**
   * Placeholder for full text search input field
   */
  fullTextSearchTxt: string;
  /////////////////////////////////////////////////////////////
  // Paths for icons
  /////////////////////////////////////////////////////////////
  /**
   * Icon path for white drop filter button
   */
  dropFilterWIconPath: string;
  /**
   * Icon path for black drop filter button
   */
  dropFilterBIconPath: string;
  /**
   * Icon path for show/hide filters button
   */
  filterIconPath: string;
  /**
   * Path for asc sorting icon
   */
  ascSortIconPath: string;
  /**
   * Path for desc sorting icon
   */
  descSortIconPath: string;
  /**
   * Paths for column header images
   * (in case column has PaginationColumnTag.ImgHeader)
   */
  columnHeaderIconPaths: Map<string,string>;
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
export function makePaginationConfig(
  options?: Partial<PaginationConfig>
): PaginationConfig
{
  const defaults: PaginationConfig = {
    viewType: PaginationViewType.Table,
    firstColumnOff: false,
    reverseItems: false,
    addEmptyItemsOnLastPage: false,
    itemCntPerPage: 1,
    visiblePagesCnt: 5,
    rowsLineClamp: null,
    disabledParts: new Set<PaginationPart>(),
    columnTags: new Map<string,Set<PaginationColumnTag>>(),
    columnFixedWidths: new Map<string, string>(),
    rowFixedHeight: null,
    tableFixedHeight: null,
    tbodyFixedHeight: null,
    noSuitableItemsTxt: "No suitable objects were found...",
    noAnyItemsTxt: "No objects were found...",
    hiddenItemsTxt: "All objects are hidden...",
    backTxt: "BACK",
    forwardTxt: "FORWARD",
    fullTextSearchTxt: "Full text search...",
    dropFilterWIconPath: "",
    dropFilterBIconPath: "",
    filterIconPath: "",
    ascSortIconPath: "",
    descSortIconPath: "",
    columnHeaderIconPaths: new Map<string,string>()
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
   * Function that must be used instead of routing
   * if an user will interact with this PaginationItem
   * data: string = route
   * (in case parameter "route" of this pagination item is not null)
   * data: PaginationItem = this.item
   * (in case parameter "route" of this pagination item is null)
   */
  altClickFunc?: (data: string | PaginationItem) => void;
  /**
    * Map object that determines the element's response
    * to the hidden filters
    * key - id of some PaginationFilter that was sent to the component
    * value - value that need to be used during the filtration
   */
  filterValues: Map<number, any> | null;
  /**
   * Settings of this PaginationItem for columns
   * (in case viewType configuration of the component is Table)
   */
  attr: {
    [key: string]: PaginationAttr;
  };
  /**
   * Indicates this item is dummy (created just for more pleasant view)
   * (in case viewType configuration of the component is Table)
   */
  dummy?: boolean;
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
  BUTTON = 8,
  LABEL = 9,
  LABELS = 10
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
    case PaginationAttrType.LABEL:
      return (attr.body as PaginationLabel).priority !== undefined
          && typeof (attr.body as PaginationLabel).priority == "number"
          && (attr.body as PaginationLabel).title !== undefined
          && typeof (attr.body as PaginationLabel).title == "string";
      break;
    case PaginationAttrType.LABELS:
      return attr.body instanceof Array
             && attr.body.length > 0
             && attr.body.map((label: any) =>
             {
               return (label as PaginationLabel).priority !== undefined
                && typeof (label as PaginationLabel).priority == "number"
                && (label as PaginationLabel).title !== undefined
                && typeof (label as PaginationLabel).title == "string";
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
 * Interface to work with ngx-kit-labels in the cells of
 * the pagination component
 * (in case viewType configuration of the component is Table)
 */
export interface PaginationLabel {
  /**
   * Value using within column sorting
   */
  priority: number;
  /**
   * Text on the label
   */
  title: string;
  /**
   * Background color of the label
   */
  bgColor?: string;
  /**
   * Text color of the label
   */
  textColor?: string;
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
  id: number;
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

/**
 * Supporting interface to store type and value pairs
 */
export interface PaginationFilterTVPair {
  type: InputType | null;
  value: any;
}

///////////////////////////////////////////////////////////////////////////////
///// Supporting elements for the table form of the pagination component //////
///////////////////////////////////////////////////////////////////////////////
/**
 * Interface to store a column information in the pagination component
 */
export interface TableColumn {
  name: string;
  type: PaginationAttrType;
  disabled: boolean;
  alignFlexClass: string;
  wordBreakClass: string;
  sorting: boolean;
  header: PaginationColumnTag.NameHeader
    | PaginationColumnTag.ImgHeader
    | PaginationColumnTag.NoHeader;
}

/**
 * Interface to store the columns during the column sorting
 */
export interface SortTableColumn {
  column: TableColumn;
  mode: SortColumnMode;
}

/**
 * Column tags determining column behaviour and view
 * (in case viewType configuration of the component is Table)
 */
export enum PaginationColumnTag {
  Enabled = 0,
  Disabled = 1,
  LeftAlign = 2,
  RightAlign = 3,
  CenterAlign = 4,
  Sort = 5,
  NoSort = 6,
  WordBreakNormal = 7,
  WordBreakWords = 8,
  WordBreakAll = 9,
  NameHeader = 10,
  ImgHeader = 11,
  NoHeader = 12
}

/**
 * Function for setting column tags in a more convenient way
 * (using objects of type: {'someColumnName': [firstTag, secondTag, ...]})
 */
export function makePaginationColumnTags(
  obj: object
): Map<string,Set<PaginationColumnTag>>
{
  return new Map<string,Set<PaginationColumnTag>>(
    Object.entries(obj).map(
      ([columnName, tags]: [string, PaginationColumnTag[]]) => 
      {
        return [columnName, new Set<PaginationColumnTag>(tags)];
      })
  );
}

/**
 * Inner pagination component function for getting
 * actual TableColumn from set of the column tags
 */
export function makeTableColumnSettings(
  tags?: Set<PaginationColumnTag>
): TableColumn
{
  const settings: Partial<TableColumn> = {};
  if (tags !== undefined)
  {
    for (let tag of tags)
    {
      switch(tag)
      {
        case PaginationColumnTag.Enabled:
          settings.disabled = false;
          break;
        case PaginationColumnTag.Disabled:
          settings.disabled = true;
          break;
        case PaginationColumnTag.LeftAlign:
          settings.alignFlexClass = "justify-start text-left";
          break;
        case PaginationColumnTag.RightAlign:
          settings.alignFlexClass = "justify-end text-right";
          break;
        case PaginationColumnTag.CenterAlign:
          settings.alignFlexClass = "justify-center text-center";
          break;
        case PaginationColumnTag.WordBreakNormal:
          settings.wordBreakClass = "break-normal";
          break;
        case PaginationColumnTag.WordBreakWords:
          settings.wordBreakClass = "break-words";
          break;
        case PaginationColumnTag.WordBreakAll:
          settings.wordBreakClass = "break-all";
          break;
        case PaginationColumnTag.Sort:
          settings.sorting = true;
          break;
        case PaginationColumnTag.NoSort:
          settings.sorting = false;
          break;
        case PaginationColumnTag.NameHeader:
        case PaginationColumnTag.ImgHeader:
        case PaginationColumnTag.NoHeader:
          settings.header = tag;
          break;
        default:
          break;
      }
    }
  }

  const defaults: TableColumn = {
    name: "UNKNOWN",
    type: PaginationAttrType.STRING,
    disabled: false,
    alignFlexClass: "justify-start",
    wordBreakClass: "break-normal",
    sorting: true,
    header: PaginationColumnTag.NameHeader,
  };

  return {
    ...defaults,
    ...settings,
  };
}

/**
 * Modes for the column sorting
 */
export enum SortColumnMode {
  OFF = 0,
  ASC = 1,
  DESC = 2
}

/**
 * Type for custom sorting pagination functions (compare-like)
 * Any custom function should receive 3 arguments:
 * a (of your expected type),
 * b (of your expected type), and
 * modeFactor (1 or -1) that will tell your
 * function is that ASC or DESC sorting
 * Your function must return a number
 */
export type PaginationSortFunc = (
  a: PaginationAttr | undefined,
  b: PaginationAttr | undefined,
  modeFactor: number
) => number

/**
 * Parts of pagination that can be updated and/or disabled
 */
export enum PaginationPart {
  Config = 0,
  Items = 1,
  Filters = 2,
  SearchField = 3,
  FirstHr = 4,
  SecondHr = 5,
  Footer = 6
}
