/**
 * Page of a document.
 *
 * Pages numered according to the order in the input list of pages.
 */
export interface DocumentPage {
  url: string;
}

export enum DocumentPageExtension {
  JPEG = "jpeg",
  PNG = "png"
}

export interface DPSTranslationCodes
{
  pageNumber?: string;
}
