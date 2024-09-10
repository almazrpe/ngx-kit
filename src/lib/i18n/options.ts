export interface TranslationOptions {
    modifier?: string;
    params?: { [key: string]: any };
    isCapitalized?: boolean;

    /**
     * String to be used if a translation is not found.
     *
     * Note that translation options given, such as capitalization flag,
     * do not affect fallback translation string, i.e. it is returned as it is.
     *
     * Fallback bracket params are injected as it would be for the normal
     * translation.
     */
    fallback?: string;
}
