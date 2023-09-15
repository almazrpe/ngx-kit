export enum Modifier {
    Default = "default",
    Many = "many",
    Short = "short"
}

/**
 * Contains information of translation code per it's purpose title.
 */
export interface TranslationCodes
{
    [title: string]: string | undefined;
}
