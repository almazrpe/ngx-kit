import { InputType } from "../input/input-type";
import { ButtonMode } from "../button/button.component";
import {
  UploadFileObject,
  UploadFilesInputConfig,
  makeUploadFilesInputConfig
} from "../input/upload-files-input/models";
import { InputValidationErrorCode  } from "../input/mat-input/error-content";
import {
  PaginationItem,
  PaginationFilter,
  PaginationConfig,
  PaginationSortFunc,
  PaginationPart
} from "../pagination/models";
import { ValidatorFn, FormControl } from "@angular/forms";
import { BehaviorSubject, Observable } from "rxjs";

export enum PopUpType {
  Empty = 0,
  YesNo = 1,
  ChoosingBtn = 2,
  Form = 3,
  Pagination = 4
}

export interface PopUpConfig extends UploadFilesInputConfig
{
  resetFieldIconPath: string;
}

/**
 * Function which allows you to create PopUpConfig object without
 * specifying all mandatory attributes
 * If you don't specify some attribute it will be taken
 * from the defaults (inside the function)
 *
 * @param options    object with one or more PopUpConfig attributes
 *                   which user decided to specify by themself
 * @returns          completed PopUpConfig object with all attributes
 */
export function makePopUpConfig(
  options?: Partial<PopUpConfig>
): PopUpConfig
{
  const defaults: PopUpConfig = {
    ...makeUploadFilesInputConfig({}),
    resetFieldIconPath: ""
  };

  return {
    ...defaults,
    ...options,
  };
}

export interface PopUpFormField {
  alreadyCompleted: boolean;
  value: any;
  name: string;
  type?: InputType;
  fileUploadType?: boolean;
  localizedName?: string;
  placeholder?: string;
  validators?: ValidatorFn[];
  autocompleteRequired?: boolean;
  showErrors?: boolean;
  customErrorMessages?: Map<InputValidationErrorCode, string>;
  fillingOptions?: BehaviorSubject<any[]>;
  hideField?: BehaviorSubject<boolean>;
  fillingFunction?: (
    controlsData: any,
    control: FormControl,
    hideField: BehaviorSubject<boolean>,
    options: BehaviorSubject<any[]>
  ) => void;
  fileUploadExtensions?: Set<string>;
  fileUploadCheckFunc?: (
    files: UploadFileObject[]
  ) => Observable<UploadFileObject[] | null>;
}

export interface PopUpChoosingBtn {
  print: string;
  value: any;
  mode?: ButtonMode;
  extraCssClasses?: string[];
}

export interface PopUpPaginationData {
  items: PaginationItem[];
  filters?: PaginationFilter[];
  config?: Partial<PaginationConfig>;
  sortFuncs?: Map<string, PaginationSortFunc>;
  updateEvt?: Observable<PaginationPart | null>;
  subtitle?: string;
}

export interface PopUpWindow {
  windowNum: number;
  type: PopUpType;
  title: string;
  formFieldsDescriptor?: (data: any) => PopUpDescriptorField[];
  fields?: PopUpFormField[];
  choosingButtons?: PopUpChoosingBtn[];
  paginationData?: PopUpPaginationData;
}

export interface PopUpResult {
  windowNum: number;
  value: any;
}

export interface PopUpDescriptorField {
  fieldName?: string;
  message: string;
  imageSrc?: string;
}
