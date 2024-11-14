export interface PinchZoomConfig {
    transitionDuration: number;
    limitZoom: number | "original image size";
    minScale: number;
    autoZoomOut: boolean;
    doubleTap: boolean;
    disabled: boolean;
    disablePan: boolean;
    overflow: "hidden" | "visible";
    disableZoomControl: "disable" | "never" | "auto";
    zoomControlScale: number;
    backgroundColor: string;
    limitPan: boolean;
    minPanScale: number;
    listeners: "auto" | "mouse and touch";
    wheel: boolean;
    wheelZoomFactor: number;
    autoHeight: boolean;
    draggableImage: boolean
}

/**
 * Function which allows you to create PinchZoomConfig object without
 * specifying all mandatory attributes
 * If you don't specify some attribute it will be taken
 * from the defaults (inside the function)
 *
 * @param options    object with one or more PinchZoomConfig attributes
 *                   which user decided to specify by themself
 * @returns          completed PinchZoomConfig object with all
 *                   attributes
 */
export function makePinchZoomConfig(
    options?: Partial<PinchZoomConfig>
): PinchZoomConfig {
    const defaults: PinchZoomConfig = {
        transitionDuration: 200,
        limitZoom: "original image size",
        minScale: 0,
        autoZoomOut: false,
        doubleTap: true,
        disabled: false,
        disablePan: false,
        overflow: "hidden",
        disableZoomControl: "auto",
        zoomControlScale: 1,
        backgroundColor: "rgba(0,0,0,0.85)",
        limitPan: false,
        minPanScale: 1.0001,
        listeners: "mouse and touch",
        wheel: true,
        wheelZoomFactor: 0.2,
        autoHeight: false,
        draggableImage: false
    };

    return {
        ...defaults,
        ...options,
    };
}

export interface PinchZoomTransform {
    scale: number;
    moveX: number;
    moveY: number
}
