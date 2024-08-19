import { VirtualKeyboardLayout } from "mathlive";

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
  initialValue: string;
  fontsDirectory: string | null;
  soundsDirectory: string | null;
  locale: string;
  smartMode: boolean;
  smartFence: boolean;
  parseMode: "math" | "text" | "latex";
  letterShapeStyle: "auto" | "tex" | "iso" | "french" | "upright";
  virtualKeyboardTxt: string;
  outputFormats: MathliveOutputFormat[];
  restrictedChars: string;
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
    initialValue: "\\frac{\\sin(x)}{\\cos(x)}",
    fontsDirectory: "assets/ngx-kit/mathlive-fonts",
    soundsDirectory: null,
    locale: "ru-RU",
    smartMode: false,
    smartFence: false,
    parseMode: "math",
    letterShapeStyle: "upright",
    virtualKeyboardTxt: "Виртуальная клавиатура",
    outputFormats: [MathliveOutputFormat.Latex, MathliveOutputFormat.MathML],
    restrictedChars:
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
      + ";:[{.<>|`~'}]_&^%$#@!."
  };

  return {
    ...defaults,
    ...options,
  };
}

/**
 * Default layout for mathlive virtual keyboard
 */
export const mathliveDefaultVirtualKeyboardLayout: VirtualKeyboardLayout = {
  label: "1",
  rows: [
    [
      "+", "-", "\\times", "\\frac{#@}{#?}",
      "\\sqrt{#0}", //"#@^{#?}",
    ],
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
    ["\\pi", "\\exp", ",", "(", ")"],
  ]
};
