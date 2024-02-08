import { AbstractControl, ValidationErrors } from "@angular/forms";

export abstract class ValidationUtils
{
  public static never(value: never): Error
  {
    return new Error(`you should define logic to handle ${value}`);
  }
}

export abstract class FormValidationUtils
{
  /**
   * Handles whitespaces in form fields.
   */
  public static validateWhitespace(
    control: AbstractControl
  ): ValidationErrors | null
  {
    let hasWhitespace: boolean = false;

    if (typeof control.value == "string")
    {
      hasWhitespace = control.value.includes(" ");
    }

    if (typeof hasWhitespace == "boolean" &&
        hasWhitespace == true)
    {
      return { whitespace: true };
    }
    else
    {
      return null;
    }
  }
}
