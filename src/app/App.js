import React, {Component} from 'react'
import axios from 'axios'
import {createStore, applyMiddleware, compose} from 'redux'
import thunk from 'redux-thunk'
import rootReducer from './reducers'
import RootAuthenticated from './containers/authenticated/Root'
import RootAnonymous from './containers/anonymous/Root'
import {Provider} from 'react-redux'
import {Router, Route, IndexRoute, browserHistory} from 'react-router'
import {syncHistoryWithStore, routerActions, routerMiddleware} from 'react-router-redux'
import {UserAuthWrapper} from 'redux-auth-wrapper'
import {Map, fromJS} from 'immutable'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import Login from './containers/anonymous/login/Login'
import IndexAuthenticated from './containers/authenticated/Index'
import IndexExercise from './containers/authenticated/exercise/Index'
import {logger} from './middlewares/Logger'
import {normalize} from 'normalizr'
import theme from './components/Theme'
import {addLocaleData, IntlProvider} from 'react-intl'
import enLocaleData from 'react-intl/locale-data/en'
import frLocaleData from 'react-intl/locale-data/fr'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import {i18n} from './utils/Messages'

import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

const data = fromJS(JSON.parse(localStorage.getItem('token')));
var tokens = data ? data.getIn(['entities', 'tokens']) : null;
var token = data ? data.get('result') : null;
var users = data ? data.getIn(['entities', 'users']) : null;
var user = tokens ? tokens.get(token).get('token_user') : null;

const initialState = {
  application: Map({
    user: user,
    token: token,
    locale: navigator.language,
    entities: Map({
      users: users,
      tokens: tokens
    }),
    ui: Map({
      navbar_left_open: false,
      navbar_right_open: true
    })
  }),
  home: Map({
    loading: false
  })
};

const baseHistory = browserHistory
const routingMiddleware = routerMiddleware(baseHistory)
const store = createStore(rootReducer, initialState, compose(
  applyMiddleware(routingMiddleware, thunk, logger),
  window.devToolsExtension && window.devToolsExtension()
));

export const api = (schema) => {
  const app = store.getState().application;
  const authToken = app.getIn(['entities', 'tokens', app.get('token'), 'token_value'])
  return axios.create({
    responseType: 'json',
    transformResponse: [function (data) {
      return fromJS(schema ? normalize(data, schema) : data)
    }],
    headers: {'X-Auth-Token': authToken}
  })
}

//Hot reload reducers in dev
if (process.env.NODE_ENV === 'development' && module.hot) {
  module.hot.accept('./reducers', () =>
    store.replaceReducer(rootReducer)
  );
}

// Create an enhanced history that syncs navigation events with the store
const history = syncHistoryWithStore(baseHistory, store)

const UserIsAuthenticated = (Component, FailureComponent = undefined) => UserAuthWrapper({
  authSelector: state => {
    var app = state.application;
    return app.getIn(['entities', 'tokens', app.get('token')])
  },
  redirectAction: routerActions.replace,
  wrapperDisplayName: 'UserIsAuthenticated',
  failureRedirectPath: '/',
  //predicate: token => token != null && //TODO test token validity
  FailureComponent
})(Component)

addLocaleData([...enLocaleData, ...frLocaleData]);
class App extends Component {
  render() {
    var locale = store.getState().application.get('locale')
    return (
      <IntlProvider locale={locale} key={locale} messages={i18n.messages[locale]}>
        <MuiThemeProvider muiTheme={getMuiTheme(theme)}>
          <Provider store={store}>
            <Router history={history}>
              <Route path='/' component={UserIsAuthenticated(RootAuthenticated, RootAnonymous)}>
                <IndexRoute component={UserIsAuthenticated(IndexAuthenticated, Login)}/>
                <Route path='/exercises' component={UserIsAuthenticated(IndexExercise)}/>
              </Route>
            </Router>
          </Provider>
        </MuiThemeProvider>
      </IntlProvider>
    );
  }
}

export default App;
