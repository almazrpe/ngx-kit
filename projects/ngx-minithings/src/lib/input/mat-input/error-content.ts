import { ErrorStateMatcher } from "@angular/material/core";

/**
 * Accessible types of validation errors
 */
export enum ErrorType {
  Required = "required",
  RequiredTrue = "requiredtrue",
  Min = "min",
  Max = "max",
  MinLength = "minlength",
  MaxLength = "maxlength",
  Email = "email",
  Pattern = "pattern"
}

/**
 * Default error messages for validation errors
 */
export function getDefaultErrorMessage(errorName: string, error: any): string
{
  switch(errorName as ErrorType)
  {
    case ErrorType.Required:
      return "Поле должно быть заполнено";
    case ErrorType.RequiredTrue:
      return "Поле должно быть отмечено";
    case ErrorType.Min:
      return `Значение не должно быть ниже ${error["min"]}`;
    case ErrorType.Max:
      return `Значение не должно быть выше ${error["max"]}`;
    case ErrorType.MinLength:
      return ("Количество символов не должно быть " +
              `меньше ${error["requiredLength"]}`);
    case ErrorType.MaxLength:
      return ("Количество символов не должно быть " +
              `больше ${error["requiredLength"]}`);
    case ErrorType.Email:
      return "Поле содержит некорректный email-адрес";
    case ErrorType.Pattern:
      return "Поле заполнено неверно";
    default:
      return "Поле содержит ошибку";
  }
}

/**
 * Custom class for proper error state detection in mat-form-field
 */
export class InputErrorStateMatcher implements ErrorStateMatcher
{
  public errorState: boolean = false;
  public isErrorState(): boolean
  {
    return this.errorState;
  }
}