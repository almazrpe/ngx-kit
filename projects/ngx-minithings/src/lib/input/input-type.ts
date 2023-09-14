/**
 * Supported by datalist types.
 *
 * Note that firefox compatibility is considered, since DM is run on
 * firefox-esr.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Element/datalist
 */
export enum InputType {
  TEXT = "text",
  PASSWORD = "password",
  SEARCH = "search",
  URL = "url",
  TEL = "tel",
  EMAIL = "email",
  NUMBER = "number"
}
