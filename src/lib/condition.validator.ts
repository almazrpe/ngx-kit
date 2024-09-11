import { AbstractControl, ValidationErrors } from "@angular/forms";
import { Observable, map, take } from "rxjs";

/**
 * Gives an error if some condition are failed.
 */
export function conditionValidatorWrapper(
    condition$: Observable<boolean>,
    errorName: string
): (control: AbstractControl) => Observable<ValidationErrors | null> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return (control: AbstractControl) => {
        return condition$.pipe(
            map((condition: boolean) => {
                const validationErrors: ValidationErrors = {};
                validationErrors[errorName] = true;
                return condition ? null : validationErrors;
            }),

            // avoid PENDING status when form waits for the new values from the
            // same async validator
            // see: https://stackoverflow.com/a/72202477/14748231
            take(1)
        );
    };
}
