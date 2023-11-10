/**
 * Supported by datalist types.
 *
 * Note that firefox compatibility is considered, since DM is run on
 * firefox-esr.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/datalist
 */
export enum InputType {
  Text = "text",
  Password = "password",
  Search = "search",
  URL = "url",
  Tel = "tel",
  Email = "email",
  Number = "number",

  Date = "date"
}
