import { SafeUrl } from "@angular/platform-browser";

export interface UploadFileObject {
  file: File;
  url: SafeUrl;
}

export interface UploadFilesInputConfig {
  filenameRepeatTranslation: string;
  unknownExtensionTranslation: string;
  wrongExtensionTranslation: string;
  abortIconPath: string;
  unknownDocIconPath: string;
}

/**
 * Function which allows you to create UploadFilesInputConfig object without
 * specifying all mandatory attributes
 * If you don't specify some attribute it will be taken
 * from the defaults (inside the function)
 *
 * @param options    object with one or more UploadFilesInputConfig attributes
 *                   which user decided to specify by themself
 * @returns          completed UploadFilesInputConfig object with all
 *                   attributes
 */
export function makeUploadFilesInputConfig(
  options?: Partial<UploadFilesInputConfig>
): UploadFilesInputConfig
{
  const defaults: UploadFilesInputConfig = {
    filenameRepeatTranslation:
      "specified more than once, the latest version was taken",
    unknownExtensionTranslation:
      "has an unknown extension and was therefore excluded",
    wrongExtensionTranslation:
      "has an inadequate extension and was therefore excluded",
    abortIconPath: "",
    unknownDocIconPath: "",
  };

  return {
    ...defaults,
    ...options,
  };
}
