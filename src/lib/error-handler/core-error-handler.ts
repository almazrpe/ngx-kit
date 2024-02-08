import { ErrorHandler, Injectable } from "@angular/core";
import { ErrorHandlerService } from "./error-handler.service";

@Injectable()
export class CoreErrorHandler implements ErrorHandler 
{
  public constructor(
    private errorHandlerService: ErrorHandlerService
  ) {}

  public handleError(error: Error): void
  {
    this.errorHandlerService.handle(error);
  }
}
