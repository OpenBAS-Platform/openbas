import React, {Component} from 'react'
import axios from 'axios'
import {createStore, applyMiddleware, compose} from 'redux'
import thunk from 'redux-thunk'
import rootReducer from './reducers'
import {Provider} from 'react-redux'
import {Router, Route, IndexRoute, browserHistory} from 'react-router'
import {syncHistoryWithStore, routerActions, routerMiddleware} from 'react-router-redux'
import {UserAuthWrapper} from 'redux-auth-wrapper'
import {Map, fromJS} from 'immutable'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import {logger} from './middlewares/Logger'
import {normalize} from 'normalizr'
import theme from './components/Theme'
import {addLocaleData, IntlProvider} from 'react-intl'
import enLocaleData from 'react-intl/locale-data/en'
import frLocaleData from 'react-intl/locale-data/fr'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import {i18n} from './utils/Messages'
import * as Constants from './constants/ActionTypes'
import injectTapEventPlugin from 'react-tap-event-plugin'
import RootAnonymous from './containers/anonymous/Root'
import Login from './containers/anonymous/login/Login'
import RootAuthenticated from './containers/authenticated/Root'
import IndexAuthenticated from './containers/authenticated/Index'
import RootExercise from './containers/authenticated/exercise/Root'
import IndexExercise from './containers/authenticated/exercise/Index'
import IndexExerciseSettings from './containers/authenticated/exercise/settings/Index'
import IndexExerciseAudience from './containers/authenticated/exercise/audience/Index'
import IndexExerciseScenario from './containers/authenticated/exercise/scenario/Index'
import IndexExerciseScenarioEvent from './containers/authenticated/exercise/scenario/event/Index'

import roundMoment from './utils/moment-round'

injectTapEventPlugin()
roundMoment()

const data = fromJS(JSON.parse(localStorage.getItem('token')))
var tokens = data ? data.getIn(['entities', 'tokens']) : null
var token = data ? data.get('result') : null
var users = data ? data.getIn(['entities', 'users']) : null
var user = tokens ? tokens.get(token).get('token_user') : null

//Default application state
const initialState = {
  application: Map({
    locale: navigator.language,
    entities: Map({
      organizations: Map(),
      files: Map(),
      exercise_statuses: Map(),
      incident_types: Map(),
      inject_types: Map(),
      inject_statuses: Map(),
      exercises: Map(),
      audiences: Map(),
      events: Map(),
      incidents: Map(),
      injects: Map()
    }),
    ui: Map({
      navbar_left_open: false,
      navbar_right_open: true,
      loading: false,
      states: Map({
        current_search_keyword: '',
        lastId: null
      })
    })
  }),
  identity: Map({
    user: user,
    token: token,
    entities: Map({
      users: users,
      tokens: tokens
    })
  })
};

let store
const baseHistory = browserHistory
const routingMiddleware = routerMiddleware(baseHistory)
//Only compose the store if devTools are available
if (process.env.NODE_ENV === 'development' && window.devToolsExtension) {
  store = createStore(rootReducer, initialState, compose(
    applyMiddleware(routingMiddleware, thunk, logger),
    window.devToolsExtension && window.devToolsExtension()
  ))
} else {
  store = createStore(rootReducer, initialState,
    applyMiddleware(routingMiddleware, thunk, logger))
}

//Axios API
export const api = (schema) => {
  const app = store.getState().identity;
  const authToken = app.getIn(['entities', 'tokens', app.get('token'), 'token_value'])
  const instance = axios.create({headers: {'X-Auth-Token': authToken}})
  //Intercept to apply schema and test unauthorized users
  instance.interceptors.response.use(function (response) {
    response.data = fromJS(schema ? normalize(response.data, schema) : response.data)
    return response
  }, function (err) {
    console.error("API error", err)
    let res = err.response;
    if (res.status === 401) {//User is not logged anymore
      localStorage.removeItem('token');
      store.dispatch({type: Constants.IDENTITY_LOGOUT_SUCCESS});
      return Promise.reject(err);
    } else if (res.status === 503 && err.config && !err.config.__isRetryRequest) {
      err.config.__isRetryRequest = true;
      return axios(err.config);
    } else {
      return Promise.reject(err);
    }
  })
  return instance
}

//Hot reload reducers in dev
if (process.env.NODE_ENV === 'development' && module.hot) {
  module.hot.accept('./reducers', () =>
    store.replaceReducer(rootReducer)
  )
}

// Create an enhanced history that syncs navigation events with the store
const history = syncHistoryWithStore(baseHistory, store)

//region authentication
const authenticationToken = (state) => state.identity.getIn(['entities', 'tokens', state.identity.get('token')])
const UserIsAuthenticated = UserAuthWrapper({
  authSelector: state => authenticationToken(state),
  redirectAction: routerActions.replace,
  failureRedirectPath: '/login',
  wrapperDisplayName: 'UserIsAuthenticated',
  //predicate: token => token != null && //TODO test token validity
})
const UserIsNotAuthenticated = UserAuthWrapper({
  authSelector: state => authenticationToken(state),
  redirectAction: routerActions.replace,
  wrapperDisplayName: 'UserIsNotAuthenticated',
  predicate: token => token === null || token === undefined,
  failureRedirectPath: (state, ownProps) => ownProps.location.query.redirect || 'private',
  allowRedirectBack: false
})
//endregion

addLocaleData([...enLocaleData, ...frLocaleData]);
class App extends Component {
  render() {
    var locale = store.getState().application.get('locale')
    return (
      <IntlProvider locale={locale} key={locale} messages={i18n.messages[locale]}>
        <MuiThemeProvider muiTheme={getMuiTheme(theme)}>
          <Provider store={store}>
            <Router history={history}>
              <Route path='/' component={UserIsNotAuthenticated(RootAnonymous)}>
                <IndexRoute component={Login}/>
                <Route path='/login' component={UserIsNotAuthenticated(Login)}/>
              </Route>
              <Route path='/private' component={UserIsAuthenticated(RootAuthenticated)}>
                <IndexRoute component={IndexAuthenticated}/>
                <Route path='exercise/:exerciseId' component={RootExercise}>
                  <IndexRoute component={IndexExercise}/>
                  <Route path='world' component={IndexExercise}/>
                  <Route path='objectives' component={IndexExercise}/>
                  <Route path='scenario' component={IndexExerciseScenario}/>
                  <Route path='scenario/:eventId' component={IndexExerciseScenarioEvent}/>
                  <Route path='audience' component={IndexExerciseAudience}/>
                  <Route path='calendar' component={IndexExercise}/>
                  <Route path='settings' component={IndexExerciseSettings}/>
                </Route>
              </Route>
            </Router>
          </Provider>
        </MuiThemeProvider>
      </IntlProvider>
    )
  }
}

export default App;
