import React, { useEffect } from 'react';
import * as PropTypes from 'prop-types';
import { IntlProvider } from 'react-intl';
import moment from 'moment';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { LocalizationProvider } from '@mui/x-date-pickers';
import frLocale from 'date-fns/locale/fr';
import enLocale from 'date-fns/locale/en-US';
import esLocale from 'date-fns/locale/es';
import cnLocale from 'date-fns/locale/zh-CN';
import 'cronstrue/locales/fr';
import 'cronstrue/locales/en';
import 'cronstrue/locales/es';
import 'cronstrue/locales/zh_CN';
import locale, { DEFAULT_LANG } from '../utils/BrowserLanguage';
import i18n from '../utils/Localization';
import { useHelper } from '../store';

const localeMap = {
  en: enLocale,
  fr: frLocale,
  es: esLocale,
  zh: cnLocale,
};

const momentMap = {
  en: 'en-us',
  fr: 'fr-fr',
  es: 'es-es',
  zh: 'zh-cn',
};

// Export LANG to be used in non-React code
// eslint-disable-next-line import/no-mutable-exports
export let LANG = DEFAULT_LANG;

const AppIntlProvider = (props) => {
  const { children } = props;
  const { platformName, lang } = useHelper((helper) => {
    const me = helper.getMe();
    const settings = helper.getPlatformSettings();
    const name = settings.platform_name ?? 'OpenBAS - Crisis Drills Planning Platform';
    const rawPlatformLang = settings.platform_lang ?? 'auto';
    const rawUserLang = me?.user_lang ?? 'auto';
    const platformLang = rawPlatformLang !== 'auto' ? rawPlatformLang : locale;
    const userLang = rawUserLang !== 'auto' ? rawUserLang : platformLang;
    return { platformName: name, lang: userLang };
  });
  LANG = lang;
  const baseMessages = i18n.messages[lang] || i18n.messages[DEFAULT_LANG];
  const momentLocale = momentMap[lang];
  moment.locale(momentLocale);
  useEffect(() => {
    document.title = platformName;
  }, [platformName]);

  return (
    <IntlProvider
      locale={lang}
      key={lang}
      messages={baseMessages}
      onError={(err) => {
        if (err.code === 'MISSING_TRANSLATION') {
          return;
        }
        throw err;
      }}
    >
      <LocalizationProvider
        dateAdapter={AdapterDateFns}
        adapterLocale={localeMap[lang]}
      >
        {children}
      </LocalizationProvider>
    </IntlProvider>
  );
};

AppIntlProvider.propTypes = {
  children: PropTypes.node,
};

const ConnectedIntlProvider = AppIntlProvider;

export default ConnectedIntlProvider;
