import LangUtil from 'src/utils/lang.util';

export type LocaleType = string;

export const locales = LangUtil.allLangs().map((i) => i.code);
