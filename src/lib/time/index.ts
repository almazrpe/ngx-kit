export namespace time {
    const timezoneOffset: number = (new Date()).getTimezoneOffset() * 60000;

    export function getComparativeDateString(dt: Date): string {
        return (new Date(
            dt.getTime() - timezoneOffset
        )).toISOString().slice(0, 10);
    }

    export function utc(): number {
        return Date.now() / 1000;
    }

    /**
     * Converts UNIX timestamp to current local Date.
    */
    export function toLocal(timestamp?: number): Date {
        if (timestamp === undefined) {
            timestamp = utc()
        }
        return new Date(timestamp * 1000);
    }
}
