import { Pipe, PipeTransform } from "@angular/core";
import { time } from "../../public-api";

@Pipe({
  name: "unixTimestampToDate"
})
export class UnixTimestampToDatePipe implements PipeTransform {

  public transform(value: number): Date {
    return time.toLocal(value);
  }

}
