export interface TranslationMapByLang
{
    [lang: string]: TranslationMap;
}

export interface TranslationMap
{
    [code: string]: TranslationUnit;
}

export interface TranslationUnit
{
    [modifier: string]: string;
}
