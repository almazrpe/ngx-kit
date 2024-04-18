import {
  AbstractControl,
  ValidationErrors,
  ValidatorFn
} from "@angular/forms";
import { BehaviorSubject } from "rxjs";

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

  /**
   * Handles cases when autocomplete is required in form fields.
   */
  public static requiredAutocompleteValidator(
    options: any[] | BehaviorSubject<any[]>
  ): ValidatorFn 
  {
    return (control: AbstractControl): ValidationErrors | null => 
    {
      if (options instanceof BehaviorSubject)
      {
        if (options.value.includes(control.value) == true)
          return null;
        else
          return { requiredautocomplete: true };
      }
      else
      {
        if (options.includes(control.value) == true)
          return null;
        else
          return { requiredautocomplete: true };
      }
    };
  }
}
