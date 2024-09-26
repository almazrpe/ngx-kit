import { FormControl } from "@angular/forms";

export interface MatSliderData {
    min: number;
    max: number;
    step: number;
    control: FormControl,
    sliderTitleFormatter?: string,
    resetBtnIconPath?: string;
}