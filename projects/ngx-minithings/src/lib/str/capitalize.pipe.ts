import { Pipe, PipeTransform } from "@angular/core";
import { capitalize } from "./str";

@Pipe({
  name: "capitalize"
})
export class CapitalizePipe implements PipeTransform 
{

  public transform(value: string): string;
  public transform(value: null): null;
  public transform(value: string | null): string | null;
  public transform(value: string | null): string | null
  {
    return value === null ? null : capitalize(value);
  }

}
