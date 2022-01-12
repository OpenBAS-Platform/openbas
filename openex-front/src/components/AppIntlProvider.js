import React, { useEffect } from 'react';
import * as PropTypes from 'prop-types';
import * as R from 'ramda';
import { connect } from 'react-redux';
import { IntlProvider } from 'react-intl';
import moment from 'moment';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import frLocale from 'date-fns/locale/fr';
import enLocale from 'date-fns/locale/en-US';
import locale, { DEFAULT_LANG } from '../utils/BrowserLanguage';
import i18n from '../utils/Localization';
import { storeBrowser } from '../actions/Schema';

const localeMap = {
  en: enLocale,
  fr: frLocale,
};

const AppIntlProvider = (props) => {
  const {
    children, userLanguage, platformLanguage, platformName,
  } = props;
  const platformLang = platformLanguage !== 'auto' ? platformLanguage : locale;
  const lang = userLanguage !== 'auto' ? userLanguage : platformLang;
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
  platformLanguage: PropTypes.string,
  platformName: PropTypes.string,
  userLanguage: PropTypes.string,
  children: PropTypes.node,
};

const select = (state) => {
  const browser = storeBrowser(state);
  const { settings, me } = browser;
  const platformName = R.propOr(
    'OpenEx - Exercises planning platform',
    'platform_name',
    settings,
  );
  const platformLanguage = R.propOr('auto', 'platform_lang', settings);
  const userLanguage = R.propOr('auto', 'user_lang', me);
  return { platformLanguage, platformName, userLanguage };
};

// eslint-disable-next-line import/prefer-default-export
export const ConnectedIntlProvider = connect(select)(AppIntlProvider);
