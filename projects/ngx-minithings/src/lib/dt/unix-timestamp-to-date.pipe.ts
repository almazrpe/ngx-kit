import { Pipe, PipeTransform } from "@angular/core";
import { convertTimestamp } from "./utils";

@Pipe({
  name: "unixTimestampToDate"
})
export class UnixTimestampToDatePipe implements PipeTransform 
{

  public transform(value: number): Date
  {
    return convertTimestamp(value);
  }

}
