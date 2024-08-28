/**
 * Supported by datalist types.
 *
 * Note that firefox compatibility is considered, since DM is run on
 * firefox-esr.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/datalist
 */
export enum InputType {
  // REGULAR
  Text = "text",
  Password = "password",
  Search = "search",
  URL = "url",
  Tel = "tel",
  Email = "email",
  Number = "number",
  // ONLY mat-input COMPONENT:
  TextArea = "textarea",
  Select = "select",
  Date = "date",
  DateRange = "daterange",
  Time = "time",
  Check = "check",
  RadioList = "radiolist",
  CheckList = "checklist",
  // NOT in mat-input COMPONENT:
  Document = "document",  // upload-files-input
  Formula = "formula"     // mathlive-input
}
