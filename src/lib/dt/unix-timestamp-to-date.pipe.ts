import { Pipe, PipeTransform } from "@angular/core";
import { DTUtils } from "./utils";

@Pipe({
  name: "unixTimestampToDate"
})
export class UnixTimestampToDatePipe implements PipeTransform {

  public transform(value: number): Date {
    return DTUtils.convertTimestamp(value);
  }

}
