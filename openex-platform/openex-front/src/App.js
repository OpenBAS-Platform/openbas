import React, { Component } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { Provider, connect } from 'react-redux';
import { createBrowserHistory } from 'history';
import { Redirect, Route, Switch } from 'react-router';
import { ConnectedRouter, routerMiddleware } from 'connected-react-router';
import { connectedRouterRedirect } from 'redux-auth-wrapper/history4/redirect';
import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';
import { normalize } from 'normalizr';
import { IntlProvider } from 'react-intl';
import * as R from 'ramda';
import Immutable from 'seamless-immutable';
import { createLogger } from 'redux-logger';
import theme from './components/Theme';
import { locale } from './utils/BrowserLanguage';
import { i18n, debug } from './utils/Messages';
import { entitiesInitializer } from './reducers/Referential';
import * as Constants from './constants/ActionTypes';
// TODO @Sam fix dependency cycle
/* eslint-disable */
import RootAnonymous from "./containers/anonymous/Root";
import RootAuthenticated from "./containers/authenticated/Root";
/* eslint-enable */
import createRootReducer from './reducers/Root';

// Default application state
const initialState = {
  app: Immutable({
    logged: JSON.parse(localStorage.getItem('logged')),
    worker: { status: 'RUNNING' },
  }),
  screen: Immutable({ navbar_left_open: false, navbar_right_open: true }),
  referential: entitiesInitializer,
};

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

let store;
export const history = createBrowserHistory();
const logger = createLogger({
  predicate: (getState, action) => !action.type.startsWith('DATA_FETCH')
    && !action.type.startsWith('@@redux-form'),
});

if (process.env.NODE_ENV === 'development' && window.devToolsExtension) {
  store = createStore(
    createRootReducer(history),
    initialState,
    compose(
      applyMiddleware(routerMiddleware(history), thunk, logger),
      window.devToolsExtension && window.devToolsExtension(),
    ),
  );
} else {
  store = createStore(
    createRootReducer(history),
    initialState,
    applyMiddleware(routerMiddleware(history), thunk),
  );
}

// Axios API
export const api = (schema) => {
  const token = R.path(['logged', 'auth'], store.getState().app);
  const instance = axios.create({
    withCredentials: true,
    headers: { 'X-Authorization-Token': token, responseType: 'json' },
  });
  // Intercept to apply schema and test unauthorized users
  instance.interceptors.response.use(
    (response) => {
      const toImmutable = response.config.responseType === undefined; //= == json
      const dataNormalize = schema
        ? normalize(response.data, schema)
        : response.data;
      debug('api', {
        from: response.request.responseURL,
        data: { raw: response.data, normalize: dataNormalize },
      });
      response.data = toImmutable ? Immutable(dataNormalize) : dataNormalize;
      return response;
    },
    (err) => {
      const res = err.response;
      // eslint-disable-next-line no-console
      console.error('api', res);
      if (res.status === 401) {
        // User is not logged anymore
        store.dispatch({ type: Constants.IDENTITY_LOGOUT_SUCCESS });
        return Promise.reject(res.data);
      }
      // eslint-disable-next-line no-underscore-dangle
      if (res.status === 503 && err.config && !err.config.__isRetryRequest) {
        // eslint-disable-next-line no-param-reassign,no-underscore-dangle
        err.config.__isRetryRequest = true;
        return axios(err.config);
      }
      return Promise.reject(res.data);
    },
  );
  return instance;
};

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

export const UserIsAdmin = connectedRouterRedirect({
  authenticatedSelector: (state) => authenticationToken(state).admin === true,
  redirectPath: '/private',
  allowRedirectBack: false,
  wrapperDisplayName: 'UserIsAdmin',
});
export const UserIsNotAuthenticated = connectedRouterRedirect({
  redirectPath: '/private',
  authenticatedSelector: (state) => authenticationToken(state) === null
    || authenticationToken(state) === undefined,
  wrapperDisplayName: 'UserIsNotAuthenticated',
  allowRedirectBack: false,
});
// endregion

class IntlWrapper extends Component {
  render() {
    const { children, lang } = this.props;
    return (
      <IntlProvider locale={lang} key={lang} messages={i18n.messages[lang]}>
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
