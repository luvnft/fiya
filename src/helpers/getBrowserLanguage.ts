import { find } from 'lodash-es';

import { Language } from '@/services/translate.js';

export const getBrowserLanguage = () => {
    const browserLanguage = navigator.language ?? '';
    const browserLanguageLowerCase = browserLanguage.toLowerCase();
    // corner case: zh-cn to Chinese_Simplified
    if (browserLanguageLowerCase === 'zh-cn') return Language.Chinese_Simplified;
    // corner case: zh-tw to Chinese_Traditional
    if (browserLanguageLowerCase === 'zh-tw') return Language.Chinese_Traditional;
    const matched = find(Object.values(Language), (lang) => browserLanguageLowerCase.startsWith(lang.toLowerCase()));
    // Use browser language if it's not matched with any of the supported languages
    return matched ?? (browserLanguage as Language);
};

export const isSameLanguageWithBrowser = (locale: string) => {
    const browserLanguage = getBrowserLanguage();
    const browserLanguageLowerCase = browserLanguage.toLowerCase();
    const localLowerCase = locale.toLowerCase();
    return browserLanguageLowerCase.startsWith(localLowerCase);
};
