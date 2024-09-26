import {
    AbstractControl,
    ValidationErrors,
    ValidatorFn
} from "@angular/forms";
import { BehaviorSubject } from "rxjs";

export abstract class ValidationUtils {
    public static never(value: never): Error {
        return new Error(`you should define logic to handle ${value}`);
    }
}

export abstract class CustomValidators {
    /**
      * Handles whitespaces in form fields.
      */
    public static noWhitespace(
      control: AbstractControl
    ): ValidationErrors | null {
        let hasWhitespace: boolean = false;

        if (typeof control.value == "string") {
            hasWhitespace = control.value.includes(" ");
        }

        if (typeof hasWhitespace == "boolean" &&
            hasWhitespace == true) {
            return { nowhitespace: true };
        } else {
            return null;
        }
    }

    /**
     * Handles cases when incoming value is in some unsuitable value set
     */
    public static inUnsuitableSet(
        uSet: Set<any>
    ): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            return uSet.has(control.value)
                ? { inunsuitableset: true } 
                : null
        };
    }

    /**
     * Handles cases when incoming value must be integer
     */
    public static mustBeInt(
        control: AbstractControl
    ): ValidationErrors | null {
        return /^[0-9]{1,}$/.test(String(control.value)) 
            ? null
            : { mustbeint: true }
    }

    /**
     * Handles cases when autocomplete is required in form fields.
     */
    public static requiredAutocomplete(
        options: any[] | BehaviorSubject<any[]>
    ): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            if (options instanceof BehaviorSubject) {
                if (options.value.includes(control.value) == true)
                    return null;
                else
                    return { requiredautocomplete: true };
            } else {
                if (options.includes(control.value) == true)
                    return null;
                else
                    return { requiredautocomplete: true };
            }
        };
    }

    /**
     * Handles latex variables whose first character is underscore
     */
    public static latexVarStartNoUnderscore(
        control: AbstractControl
    ): ValidationErrors | null {
        let hasWrongVar: boolean = false;

        if (typeof control.value == "string") {
            hasWrongVar = /\\mathit{(\\_.*?)}/.test(control.value);
        }

        return hasWrongVar ? { latexvarstartnounderscore: true } : null;
    }

    /**
     * Handles latex variables whose size is lower than minSize
     */
    public static latexVarSizeMin(
        minSize: number
    ): ValidatorFn {
        const re = new RegExp(`\\mathit{(.{1,${minSize - 1}}?)}`);
        return (control: AbstractControl): ValidationErrors | null => {
            let hasWrongVar: boolean = false;

            if (typeof control.value == "string") {
                hasWrongVar = re.test(control.value);
            }

            return hasWrongVar 
                ? { latexvarsizemin: {"minSize": minSize} } 
                : null;
        };
    }
}
