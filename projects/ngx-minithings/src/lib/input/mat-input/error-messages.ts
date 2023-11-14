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
