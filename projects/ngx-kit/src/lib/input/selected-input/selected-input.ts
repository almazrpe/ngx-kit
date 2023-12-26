import { InputType } from "../input-type";
import { ValueValidator } from "./value-validator";
import { ValueValidatorEvent } from "./value-validator-event";

/**
 * Describes a change of a selected input value by someone in the system.
 */
export interface SelectedInputEvent<T> {
    host: ValueHost;
    selectedInput: SelectedInput<T>;
    value: T | ValueValidatorEvent;
    /**
     * Whether this event carries selected input or not.
     *
     * On deselect, the selected input service sends the last selected input,
     * empty string value and isSelected=false to comply with this event
     * interface and signify that the input was deselected.
     */
    isSelected: boolean;
}

export interface SelectedInput<T> {
    id: string;
    name: string;
    type: InputType;
    inputValueValidators?: ValueValidator<T>[];
    blurValueValidators?: ValueValidator<T>[];
}

/**
 * The author of the new value in the selected input.
 */
export enum ValueHost {
    /**
     * Input DOM object itself.
     */
    INPUT = "input",
    /**
     * Virtual keyboard action.
     */
    KEYBOARD = "keyboard"
}
