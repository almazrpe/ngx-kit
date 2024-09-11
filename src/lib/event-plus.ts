/**
 * Extended version of the default DOM Event.
 */
export interface EventPlus extends Event {
    extraData?: any
}


export interface EventPlusCreate {
    extraData?: any
}


export abstract class EventPlusUtils {
    /**
     * Creates EventPlus from a default DOM event.
     *
     * @param event default DOM event
     * @returns EventPlus created from the event passed.
     */
    public static createEventPlus(
        event: Event,
        dataCreate: EventPlusCreate
    ): EventPlus {
        return {
            extraData: dataCreate.extraData,
            ...event
        };
    }
}
