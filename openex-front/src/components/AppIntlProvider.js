import React, { useEffect } from 'react';
import * as PropTypes from 'prop-types';
import { IntlProvider } from 'react-intl';
import moment from 'moment';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import frLocale from 'date-fns/locale/fr';
import enLocale from 'date-fns/locale/en-US';
import locale, { DEFAULT_LANG } from '../utils/BrowserLanguage';
import i18n from '../utils/Localization';
import { useHelper } from '../store';

const localeMap = {
  en: enLocale,
  fr: frLocale,
};

const AppIntlProvider = (props) => {
  const { children } = props;
  const { platformName, lang } = useHelper((helper) => {
    const me = helper.getMe();
    const settings = helper.getSettings();
    const name = settings.platform_name ?? 'OpenEx - Exercises planning platform';
    const rawPlatformLang = settings.platform_lang ?? 'auto';
    const rawUserLang = me?.user_lang ?? 'auto';
    const platformLang = rawPlatformLang !== 'auto' ? rawPlatformLang : locale;
    const userLang = rawUserLang !== 'auto' ? rawUserLang : platformLang;
    return { platformName: name, lang: userLang };
  });
  const baseMessages = i18n.messages[lang] || i18n.messages[DEFAULT_LANG];
  if (lang === 'fr') {
    moment.locale('fr');
  } else {
    moment.locale('en-us');
  }
  useEffect(() => {
    document.title = platformName;
  }, []);
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
        locale={localeMap[locale]}
      >
        {children}
      </LocalizationProvider>
    </IntlProvider>
  );
};

AppIntlProvider.propTypes = {
  children: PropTypes.node,
};

export const ConnectedIntlProvider = AppIntlProvider;
