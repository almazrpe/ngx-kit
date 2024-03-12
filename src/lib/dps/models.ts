export interface DPSConfig {
  pageNumberTranslation: string;
  noSuchDocPageTranslation: string;
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
): DPSConfig
{
  const defaults: DPSConfig = {
    pageNumberTranslation:
      "Page number",
    noSuchDocPageTranslation:
      "There is no such document page:",
  };

  return {
    ...defaults,
    ...options,
  };
}
