import { ErrorStateMatcher } from "@angular/material/core";

/**
 * Accessible types of validation errors
 */
export enum InputValidationErrorCode {
  Required = "required",
  RequiredTrue = "requiredtrue",
  Min = "min",
  Max = "max",
  MinLength = "minlength",
  MaxLength = "maxlength",
  Email = "email",
  Pattern = "pattern",
  // Custom validation errors from validation.ts
  RequiredAutocomplete = "requiredautocomplete",
  Whitespace = "whitespace"
}

/**
 * Default error messages for validation errors
 */
export function getDefaultErrorMessage(errorName: string, error: any): string {
  switch(errorName as InputValidationErrorCode) {
    case InputValidationErrorCode.Required:
      return "The field must be filled in";
    case InputValidationErrorCode.RequiredTrue:
      return "The field must be checked";
    case InputValidationErrorCode.Min:
      return `The value must be below ${error["min"]}`;
    case InputValidationErrorCode.Max:
      return `The value must be above ${error["max"]}`;
    case InputValidationErrorCode.MinLength:
      return ("The number of characters must be " +
              `below ${error["requiredLength"]}`);
    case InputValidationErrorCode.MaxLength:
      return ("The number of characters must be " +
              `above ${error["requiredLength"]}`);
    case InputValidationErrorCode.Email:
      return "The field contains an incorrect email";
    case InputValidationErrorCode.Pattern:
      return "The field is filled in incorrectly";
    case InputValidationErrorCode.RequiredAutocomplete:
      return "You must choose a suggested option";
    case InputValidationErrorCode.Whitespace:
      return "Whitespaces are restricted for this field";
    default:
      return "The field contains an error";
  }
}

/**
 * Custom class for proper error state detection in mat-form-field
 */
export class InputErrorStateMatcher implements ErrorStateMatcher {
  public errorState: boolean = false;
  public isErrorState(): boolean {
    return this.errorState;
  }
}