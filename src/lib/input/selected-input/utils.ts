import { ValueValidator } from "./value-validator";

/**
 * Checks incoming value against all given value validators and return
 * new value to set or undefined if there is no new value by passing
 * all validators.
 *
 * @param value value to check
 * @param valueValidators which validators to use in the checking
 * @returns a new value to set or undefined if all checks were passed
 */
export function checkValueAgainstValidators(
    value: string,
    valueValidators: ValueValidator<any>[]
): any | undefined {
    let validatorResult: any | undefined;

    for (const validator of valueValidators) {
        validatorResult = validator(value);

        if (validatorResult !== undefined) {
            return validatorResult;
        }
    }
}
