/**
 * Option of datalist.
 */
export interface DatalistOption<Type = any> {
  /**
   * Value to be displayed.
   */
  value: string;

  /**
   * Object to reference for this option.
   */
  obj?: Type;
}
