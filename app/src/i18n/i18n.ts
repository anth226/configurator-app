import { dictionary, locale, _ } from 'svelte-i18n';
import en from './en.json'
import fi from './fi.json'
import sv from './sv.json'

const initI18n = ({ withLocale: lang }: {withLocale: string} = { withLocale: 'fi'}) => {
  dictionary.set({
    en: en,
    fi: fi,
    sv: sv,
  });
  locale.set(lang);
  // could also use built in locale initialization 
  // init({
  //   fallbackLocale: 'fi',
  //   initialLocale: getLocaleFromQueryString('lang'),
  // })
}
export {
  _,
  initI18n
};