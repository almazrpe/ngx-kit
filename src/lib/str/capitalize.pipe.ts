import { Pipe, PipeTransform } from "@angular/core";
import { StringUtils } from "./utils";

@Pipe({
    name: "capitalize"
})
export class CapitalizePipe implements PipeTransform {

    public transform(value: string): string;
    public transform(value: null): null;
    public transform(value: string | null): string | null;
    public transform(value: string | null): string | null {
        return value === null ? null : StringUtils.capitalize(value);
    }

}
