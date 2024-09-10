import { ValueValidatorEvent } from "./value-validator-event";

/**
 * Validates value and returns a fallback value to be set instead in negative
 * case and nothing in positive case.
 *
 * Also can return different ValueValidatorEvents, such as Clear, signifies
 * that the value should be cleared.
 *
 * The Validator always accepts string values, since it may come from places
 * where only strings are possible to be input (such as virtual keyboard), each
 * respective validator function should make required conversions on the way.
 */
export type ValueValidator<T> =
    (value: string) => T | ValueValidatorEvent | undefined;
