import {
  VirtualKeyboardLayout,
  VirtualKeyboardName,
  Keybinding
} from "mathlive";

/**
 * Output math formats supported by mathlive.
 *
 * @see https://cortexjs.io/docs/mathlive/#(OutputFormat%3Atype)
 */
export enum MathliveOutputFormat {
  ASCIIMath = "ascii-math",
  Latex = "latex",
  LatexExpanded = "latex-expanded",
  LatexUnstyled = "latex-unstyled",
  MathJSON = "math-json",
  MathML = "math-ml",
  Spoken = "spoken",
  SpokenText = "spoken-text",
  SpokenSSML = "spoken-ssml",
  SpokenSSMLHighlight = "spoken-ssml-with-highlighting"
}

/**
 * Main configuration interface that can be sent to the component
 * You can create Partial<MathliveInputConfig> and send it to the component,
 * default values from makeMathliveInputConfig will be used then
 * for missing fields
 */
export interface MathliveInputConfig {
  /**
   * Path to directory with default mathlive fonts
   * (custom fonts restricted)
   */
  fontsDirectory: string | null;
  /**
   * Path to directory with mathlive sound effects
   */
  soundsDirectory: string | null;
  /**
   * The locale (language + region) to use for
   * string localization in the component
   */
  locale: string;
  /**
   * @see https://cortexjs.io/docs/mathlive/#(EditingOptions%3Atype)
   */
  smartMode: boolean;
  /**
   * @see https://cortexjs.io/docs/mathlive/#(EditingOptions%3Atype)
   */
  smartFence: boolean;
  /**
   * @see https://cortexjs.io/docs/mathlive/#(ParseMode%3Atype)
   */
  parseMode: "math" | "text" | "latex";
  /**
   * @see https://cortexjs.io/docs/mathlive/#(LayoutOptions%3Atype)
   */
  letterShapeStyle: "auto" | "tex" | "iso" | "french" | "upright";
  /**
   * Tooltip for the virtual keyboard button
   */
  virtualKeyboardTxt: string;
  /**
   * List of formats that should be used for inputValue events
   */
  outputFormats: MathliveOutputFormat[];
  /**
   * Chars that should be identified as variables
   */
  variableChars: string;
  /**
   * Rule that should be used for identification of multi character variables
   */
  variableRegex: RegExp | null;
  /**
   * Chars that should be expelled
   */
  restrictedChars: string;
  /**
   * Additional bindings for regular keyboard
   * (e.g. when you need to trigger some latex command throw keys)
   */
  additionalKeybindings: Keybinding[];
}

/**
 * Function which allows to create MathliveInputConfig object without
 * specifying all mandatory attributes
 * If you don't specify some attribute it will be taken
 * from the defaults (inside the function)
 *
 * @param options    object with one or more PaginationConfig attributes which
 *                   user decided to specify by themself
 * @returns          completed PaginationConfig object with all attributes
 */
export function makeMathliveInputConfig(
  options?: Partial<MathliveInputConfig>
): MathliveInputConfig
{
  const defaults: MathliveInputConfig = {
    fontsDirectory: null,
    soundsDirectory: null,
    locale: "en-EN",
    smartMode: false,
    smartFence: false,
    parseMode: "math",
    letterShapeStyle: "iso",
    virtualKeyboardTxt: "Virtual keyboard",
    outputFormats: [MathliveOutputFormat.Latex, MathliveOutputFormat.MathML],
    variableChars: "",
    variableRegex: null,
    restrictedChars: "",
    additionalKeybindings: []
  };

  return {
    ...defaults,
    ...options,
  };
}

/**
 * Type definitions for more appropriate naming
 */
export type MathliveVKLayout = VirtualKeyboardLayout;
export type MathliveVKName = VirtualKeyboardName;

/**
 * Default layout for mathlive virtual keyboard
 */
export const mathliveDefaultVKLayout: MathliveVKLayout = {
  label: "default",
  rows: [
    [
      "+", "-", "*",
      //"\\frac{#@}{#?}",
      //"\\sqrt{#0}",
      "#@^{#?}",
    ],
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
    ["\\pi", "\\exp", ".", "(", ")"],
  ]
};
