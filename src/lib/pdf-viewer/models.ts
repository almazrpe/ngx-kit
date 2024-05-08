export interface PdfViewerConfig {
  pageNumberTranslation: string;
  noSuchDocPageTranslation: string;
  returnIconPath: string;
  pageUpIconPath: string;
  pageDownIconPath: string;
  zoomUpIconPath: string;
  zoomDownIconPath: string;
  pdfWorkerPath: string | null;
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
export function makePdfViewerConfig(
  options?: Partial<PdfViewerConfig>
): PdfViewerConfig
{
  const defaults: PdfViewerConfig = {
    pageNumberTranslation:
      "Page number",
    noSuchDocPageTranslation:
      "There is no such document page:",
    returnIconPath: "",
    pageUpIconPath: "",
    pageDownIconPath: "",
    zoomUpIconPath: "",
    zoomDownIconPath: "",
    pdfWorkerPath: null,
  };

  return {
    ...defaults,
    ...options,
  };
}
