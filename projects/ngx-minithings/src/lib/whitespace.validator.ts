import { AbstractControl, ValidationErrors } from "@angular/forms";

/**
 * Handles whitespaces in form fields.
 */
export function whitespaceValidator(
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
