import { DatalistOption } from "../datalist/datalist-option";
import { InputType } from "../input/input-type";

export enum ChoosingControlType {
    DATALIST = "datalist",
    INPUT = "input"
}

export interface ChoosingControl {
    type: ChoosingControlType;
    labelText: string;
    options?: DatalistOption<any>[];
    inputType?: InputType;
    inputMin?: number;
    inputMax?: number;
}
