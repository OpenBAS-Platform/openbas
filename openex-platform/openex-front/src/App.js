import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect, Provider } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router';
import { ConnectedRouter } from 'connected-react-router';
import { connectedRouterRedirect } from 'redux-auth-wrapper/history4/redirect';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { IntlProvider } from 'react-intl';
import * as R from 'ramda';
import theme from './components/Theme';
import { locale } from './utils/BrowserLanguage';
import { i18n } from './utils/Messages';
import RootAnonymous from './containers/anonymous/Root';
import RootAuthenticated from './containers/authenticated/Root';
import { history, store } from './Store';

// Console patch in dev temporary disable react intl failure
if (process.env.NODE_ENV === 'development') {
  // eslint-disable-next-line no-console
  const originalConsoleError = console.error;
  // eslint-disable-next-line no-console
  if (console.error === originalConsoleError) {
    // eslint-disable-next-line no-console
    console.error = (...args) => {
      if (args && args[0].indexOf('[React Intl]') === 0) return;
      originalConsoleError.call(console, ...args);
    };
  }
}

// region authentication
const authenticationToken = (state) => state.app.logged;
export const UserIsAuthenticated = connectedRouterRedirect({
  redirectPath: '/login',
  authenticatedSelector: (state) => !(
    authenticationToken(state) === null
      || authenticationToken(state) === undefined
  ),
  wrapperDisplayName: 'UserIsAuthenticated',
});
// endregion

class IntlWrapper extends Component {
  render() {
    const { children, lang } = this.props;
    const intlError = (error) => {
      const matchingLocale = /for locale: "([a-z]+)"/gm;
      const regMatch = matchingLocale.exec(error);
      const currentLocale = regMatch !== null ? regMatch[1] : null;
      // eslint-disable-next-line no-console
      if (currentLocale && currentLocale !== 'en') console.error(error);
    };
    return (
      <IntlProvider
        locale={lang}
        onError={intlError}
        key={lang}
        messages={i18n.messages[lang]}
      >
        {children}
      </IntlProvider>
    );
  }
}

IntlWrapper.propTypes = {
  lang: PropTypes.string,
  children: PropTypes.node,
};

const select = (state) => {
  const lang = R.pathOr('auto', ['logged', 'lang'], state.app);
  return { lang: lang === 'auto' ? locale : lang };
};

const ConnectedIntl = connect(select)(IntlWrapper);

class App extends Component {
  // eslint-disable-next-line class-methods-use-this
  render() {
    return (
      <ThemeProvider theme={createMuiTheme(theme)}>
        <ConnectedIntl store={store}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <Switch>
                <Redirect exact from="/" to="/private" />
                <Route
                  path="/private"
                  component={UserIsAuthenticated(RootAuthenticated)}
                />
                <Route path="/" component={RootAnonymous} />
              </Switch>
            </ConnectedRouter>
          </Provider>
        </ConnectedIntl>
      </ThemeProvider>
    );
  }
}

export default App;
