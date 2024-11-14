import { 
    makePinchZoomConfig, 
    PinchZoomConfig 
} from "ngx-kit/pinch-zoom/model";

export interface ImgViewerConfig extends PinchZoomConfig {
    backBtnIconPath: string;
    drawBackBtn: boolean
}

/**
 * Function which allows you to create ImgViewerConfig object without
 * specifying all mandatory attributes
 * If you don't specify some attribute it will be taken
 * from the defaults (inside the function)
 *
 * @param options    object with one or more ImgViewerConfig attributes
 *                   which user decided to specify by themself
 * @returns          completed ImgViewerConfig object with all
 *                   attributes
 */
export function makeImgViewerConfig(
    options?: Partial<ImgViewerConfig>
): ImgViewerConfig {
    const defaults: ImgViewerConfig = {
        ...makePinchZoomConfig(),
        backBtnIconPath: "",
        drawBackBtn: false
    };

    return {
        ...defaults,
        ...options,
    };
}
