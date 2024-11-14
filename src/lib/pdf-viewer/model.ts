import { 
    makePinchZoomConfig, 
    PinchZoomConfig, 
    PinchZoomTransform
} from "ngx-kit/pinch-zoom/model";

export interface PdfViewerConfig extends PinchZoomConfig {
    backBtnIconPath: string;
    pdfWorkerPath: string | null;
    drawBackBtn: boolean
}

/**
 * Function which allows you to create PdfViewerConfig object without
 * specifying all mandatory attributes
 * If you don't specify some attribute it will be taken
 * from the defaults (inside the function)
 *
 * @param options    object with one or more PdfViewerConfig attributes
 *                   which user decided to specify by themself
 * @returns          completed PdfViewerConfig object with all
 *                   attributes
 */
export function makePdfViewerConfig(
    options?: Partial<PdfViewerConfig>
): PdfViewerConfig {
    const defaults: PdfViewerConfig = {
        ...makePinchZoomConfig(),
        backBtnIconPath: "",
        pdfWorkerPath: null,
        drawBackBtn: false
    };

    return {
        ...defaults,
        ...options,
    };
}

export interface ExtendedPinchZoomTransform extends PinchZoomTransform {
    scrollY: number
}
