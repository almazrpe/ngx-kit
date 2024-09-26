import { Component, Input } from "@angular/core";
import { MatSliderData } from "./model";
import { ButtonMode } from "../../button/button.component";

@Component({
    selector: "ngx-kit-mat-slider",
    templateUrl: "./mat-slider.component.html",
    styleUrls: ["./mat-slider-design.scss"]
})
export class MatSliderComponent {
    @Input() public sliderData: MatSliderData;
    @Input() public showResetBtn: boolean = false;

    public defaultSliderTitleFormatter: string = "${value}"
    public ButtonMode: any = ButtonMode

    public customFormatMatSliderLabel(
        fstr: string
    ): (value: number) => string {
        return (value: number): string => {
            return fstr.replaceAll("${value}", String(value))
        };
    }
}
