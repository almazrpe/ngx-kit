import { Pipe, PipeTransform } from "@angular/core";
import { StringUtils } from "./utils";

@Pipe({
    name: "capitalizeEach"
})
export class CapitalizeEachPipe implements PipeTransform {

    public transform(values: string[]): string[];
    public transform(values: null): null;
    public transform(values: string[] | null): string[] | null;
    public transform(values: string[] | null): string[] | null {
        if (values === null) {
            return null;
        } else {
            return values.map(v => StringUtils.capitalize(v));
        }
    }

}
