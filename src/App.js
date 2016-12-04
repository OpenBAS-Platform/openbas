import React, {Component} from 'react'
import axios from 'axios'
import {createStore, applyMiddleware, compose} from 'redux'
import thunk from 'redux-thunk'
import rootReducer from './reducers'
import {Provider} from 'react-redux'
import {Router, Route, IndexRoute, browserHistory} from 'react-router'
import {syncHistoryWithStore, routerActions, routerMiddleware} from 'react-router-redux'
import {UserAuthWrapper} from 'redux-auth-wrapper'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import {logger} from './middlewares/Logger'
import {normalize} from 'normalizr'
import theme from './components/Theme'
import {addLocaleData, IntlProvider} from 'react-intl'
import enLocaleData from 'react-intl/locale-data/en'
import frLocaleData from 'react-intl/locale-data/fr'
import {locale} from './utils/BrowserLanguage'
import {i18n} from './utils/Messages'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import * as Constants from './constants/ActionTypes'
import R from 'ramda'
import injectTapEventPlugin from 'react-tap-event-plugin'
import RootAnonymous from './containers/anonymous/Root'
import Login from './containers/anonymous/login/Login'
import IndexComcheck from './containers/anonymous/comcheck/Index'
import RootAuthenticated from './containers/authenticated/Root'
import IndexAuthenticated from './containers/authenticated/Index'
import RootAdmin from './containers/authenticated/admin/Root'
import IndexAdmin from './containers/authenticated/admin/Index'
import IndexAdminUsers from './containers/authenticated/admin/user/Index'
import IndexAdminGroups from './containers/authenticated/admin/group/Index'
import RootUser from './containers/authenticated/user/Root'
import IndexUserProfile from './containers/authenticated/user/profile/Index'
import RootExercise from './containers/authenticated/exercise/Root'
import IndexExercise from './containers/authenticated/exercise/Index'
import IndexExerciseSettings from './containers/authenticated/exercise/settings/Index'
import IndexExerciseObjectives from './containers/authenticated/exercise/objective/Index'
import IndexExerciseAudience from './containers/authenticated/exercise/audience/Index'
import IndexExerciseScenario from './containers/authenticated/exercise/scenario/Index'
import IndexExerciseScenarioEvent from './containers/authenticated/exercise/scenario/event/Index'
import IndexExerciseChecks from './containers/authenticated/exercise/check/Index'
import IndexExcerciseDryrun from './containers/authenticated/exercise/check/Dryrun'
import IndexExerciseComcheck from './containers/authenticated/exercise/check/Comcheck'

import Immutable from 'seamless-immutable'

import roundMoment from './utils/Moment-round'

injectTapEventPlugin()
roundMoment()

//Default application state
const initialState = {
  app: Immutable({
    logged: JSON.parse(localStorage.getItem('logged')),
    locale: locale
  }),
  screen: Immutable({
    navbar_left_open: false,
    navbar_right_open: true
  }),
  referential: Immutable({
    entities: Immutable({
      files: Immutable({}),
      users: Immutable({}),
      groups: Immutable({}),
      organizations: Immutable({}),
      tokens: Immutable({}),
      exercises: Immutable({}),
      objectives: Immutable({}),
      subobjectives: Immutable({}),
      comchecks: Immutable({}),
      comchecks_statuses: Immutable({}),
      dryruns: Immutable({}),
      dryinjects: Immutable({}),
      audiences: Immutable({}),
      events:Immutable({}),
      incidents: Immutable({}),
      injects: Immutable({}),
      inject_types: Immutable({}),
      inject_statuses: Immutable({})
    })
  })
}

//Console patch in dev temporary disable react intl failure
if (process.env.NODE_ENV === 'development') {
  const originalConsoleError = console.error
  if (console.error === originalConsoleError) {
    console.error = (...args) => {
      if (args && args[0].indexOf('[React Intl]') === 0) {return}
      originalConsoleError.call(console, ...args)
    }
  }
}

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
  var token = R.path(['logged', 'auth'], store.getState().app)
  const instance = axios.create({headers: {'X-Auth-Token': token}})
  //Intercept to apply schema and test unauthorized users
  instance.interceptors.response.use(function (response) {
    console.log("API response", response.data)
    response.data = Immutable(schema ? normalize(response.data, schema) : response.data)
    return response
  }, function (err) {
    let res = err.response;
    console.error("API error", res)
    if (res.status === 401) {//User is not logged anymore
      store.dispatch({type: Constants.IDENTITY_LOGOUT_SUCCESS});
      return Promise.reject(res.data);
    } else if (res.status === 503 && err.config && !err.config.__isRetryRequest) {
      err.config.__isRetryRequest = true;
      return axios(err.config);
    } else {
      return Promise.reject(res.data);
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
const authenticationToken = (state) => state.app.logged
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
    var locale = store.getState().app.locale
    return (
      <IntlProvider locale={locale} key={locale} messages={i18n.messages[locale]}>
        <MuiThemeProvider muiTheme={getMuiTheme(theme)}>
          <Provider store={store}>
            <Router history={history}>
              <Route path='/' component={UserIsNotAuthenticated(RootAnonymous)}>
                <IndexRoute component={Login}/>
                <Route path='/login' component={UserIsNotAuthenticated(Login)}/>
                <Route path='/comcheck/:statusId' component={IndexComcheck}/>
              </Route>
              <Route path='/private' component={UserIsAuthenticated(RootAuthenticated)}>
                <IndexRoute component={IndexAuthenticated}/>
                <Route path='admin' component={RootAdmin}>
                  <Route path='index' component={IndexAdmin}/>
                  <Route path='users' component={IndexAdminUsers}/>
                  <Route path='groups' component={IndexAdminGroups}/>
                </Route>
                <Route path='user' component={RootUser}>
                  <Route path='profile' component={IndexUserProfile}/>
                </Route>
                <Route path='exercise/:exerciseId' component={RootExercise}>
                  <IndexRoute component={IndexExercise}/>
                  <Route path='world' component={IndexExercise}/>
                  <Route path='checks' component={IndexExerciseChecks}/>
                  <Route path='checks/dryrun/:dryrunId' component={IndexExcerciseDryrun}/>
                  <Route path='checks/comcheck/:comcheckId' component={IndexExerciseComcheck}/>
                  <Route path='objectives' component={IndexExerciseObjectives}/>
                  <Route path='scenario' component={IndexExerciseScenario}/>
                  <Route path='scenario/:eventId' component={IndexExerciseScenarioEvent}/>
                  <Route path='audience' component={IndexExerciseAudience}/>
                  <Route path='calendar' component={IndexExercise}/>
                  <Route path='settings' component={IndexExerciseSettings}/>
                  <Route path='profile' component={IndexUserProfile}/>
                </Route>
              </Route>
            </Router>
          </Provider>
        </MuiThemeProvider>
      </IntlProvider>
    )
  }
}

export default App
