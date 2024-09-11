export interface DPSConfig {
    pinchZoomFlag: boolean;
    pageNumberTranslation: string;
    noSuchDocPageTranslation: string;
    imgNotFoundTranslation: string;
    returnIconPath: string;
    pageUpIconPath: string;
    pageDownIconPath: string;
    clockwiseIconPath: string;
    counterClockwiseIconPath: string;
    resetImageIconPath: string;
    showDPSLControllerIconPath: string;
    controllerArrowIconPath: string;
    controllerPlusIconPath: string;
    controllerMinusIconPath: string;
}

/**
 * Function which allows you to create DPSConfig object without
 * specifying all mandatory attributes
 * If you don't specify some attribute it will be taken
 * from the defaults (inside the function)
 *
 * @param options    object with one or more DPSConfig attributes
 *                   which user decided to specify by themself
 * @returns          completed DPSConfig object with all
 *                   attributes
 */
export function makeDPSConfig(
    options?: Partial<DPSConfig>
): DPSConfig {
    const defaults: DPSConfig = {
        pinchZoomFlag: false,
        pageNumberTranslation: "Page number",
        noSuchDocPageTranslation: "There is no such document page:",
        imgNotFoundTranslation: "Image not found",
        returnIconPath: "",
        pageUpIconPath: "",
        pageDownIconPath: "",
        clockwiseIconPath: "",
        counterClockwiseIconPath: "",
        resetImageIconPath: "",
        showDPSLControllerIconPath: "",
        controllerArrowIconPath: "",
        controllerPlusIconPath: "",
        controllerMinusIconPath: "",
    };

    return {
        ...defaults,
        ...options,
    };
}
