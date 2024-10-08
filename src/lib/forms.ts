import { AbstractControl } from "@angular/forms";

export abstract class FormUtils {
    /**
     * Retrieve name of the given form control.
     *
     * @param control Control to work with
     * @return Name of the form control specified
     * @see https://stackoverflow.com/a/46259916
     */
    public static getControlName(control: AbstractControl): string | null {
        const formGroup: any = control["_parent"].controls;
        return Object.keys(formGroup)
            .find(name => control === formGroup[name]) ?? null;
    }
}
