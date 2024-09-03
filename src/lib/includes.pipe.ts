import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "includes"
})
export class IncludesPipe implements PipeTransform {

  public transform(arr: string[] | null, value: string): boolean {
    if (arr === null) {
      return false;
    } else {
      return arr.includes(value);
    }
  }
}
