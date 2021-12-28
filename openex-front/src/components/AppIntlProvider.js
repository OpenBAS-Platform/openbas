import React from 'react';
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

const localeMap = {
  en: enLocale,
  fr: frLocale,
};

const AppIntlProvider = (props) => {
  const { children, userLanguage, platformLanguage } = props;
  const platformLang = platformLanguage !== 'auto' ? platformLanguage : locale;
  const lang = userLanguage !== 'auto' ? userLanguage : platformLang;
  const baseMessages = i18n.messages[lang] || i18n.messages[DEFAULT_LANG];
  if (lang === 'fr') {
    moment.locale('fr');
  } else {
    moment.locale('en-us');
  }
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
  userLanguage: PropTypes.string,
  children: PropTypes.node,
};

const select = (state) => {
  const platformLanguage = R.pathOr('auto', ['parameters', 'lang'], state.app);
  const userLanguage = R.pathOr('auto', ['logged', 'lang'], state.app);
  return { platformLanguage, userLanguage };
};

// eslint-disable-next-line import/prefer-default-export
export const ConnectedIntlProvider = connect(select)(AppIntlProvider);
