import * as langs from 'langs';
import { capitalizeFirstLetter } from 'src/common/stringHelper';

export interface Lang {
  code: string;
  langIso: string;
  name: string;
  title: string;
  label: string;
}

function langToLanguage(lang: langs.Language): Lang {
  return {
    code: lang['1'],
    label: lang.local,
    langIso: lang['2T'],
    name: lang.name.toLocaleLowerCase(),
    title: lang.name, // Origin language name
  };
}
const LangUtil = {
  findLang(val: string, type: 'name' | 'local'): Lang | null {
    const lang = langs.where(type, capitalizeFirstLetter(val.toLowerCase()));
    if (!lang) return null;

    return langToLanguage(lang);
  },
  getLangs(val: string[], type: 'name' | 'local' = 'name'): Lang[] {
    return val.map((i) => this.findLang(i, type)).filter((i) => !!i);
  },
  allLangs(): Lang[] {
    return langs.all().map((i) => langToLanguage(i));
  },
};

export default LangUtil;
