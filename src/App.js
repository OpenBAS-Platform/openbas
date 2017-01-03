import React, {Component, PropTypes} from 'react'
import axios from 'axios'
import {createStore, applyMiddleware, compose} from 'redux'
import thunk from 'redux-thunk'
import rootReducer from './reducers'
import {Provider, connect} from 'react-redux'
import {Router, Route, IndexRoute, browserHistory} from 'react-router'
import {syncHistoryWithStore, routerActions, routerMiddleware} from 'react-router-redux'
import {UserAuthWrapper} from 'redux-auth-wrapper'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import {normalize} from 'normalizr'
import theme from './components/Theme'
import {addLocaleData, IntlProvider} from 'react-intl'
import enLocaleData from 'react-intl/locale-data/en'
import frLocaleData from 'react-intl/locale-data/fr'
import {locale} from './utils/BrowserLanguage'
import {i18n, debug} from './utils/Messages'
import {entitiesInitializer} from './reducers/Referential'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import * as Constants from './constants/ActionTypes'
import R from 'ramda'
import injectTapEventPlugin from 'react-tap-event-plugin'
import RootAnonymous from './containers/anonymous/Root'
import Login from './containers/anonymous/login/Login'
import IndexComcheck from './containers/anonymous/comcheck/Index'
import RootAuthenticated from './containers/authenticated/Root'
import NoWorker from './containers/authenticated/NoWorker'
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
import IndexExerciseExecution from './containers/authenticated/exercise/execution/Index'
import IndexExerciseChecks from './containers/authenticated/exercise/check/Index'
import IndexExerciseDryrun from './containers/authenticated/exercise/check/Dryrun'
import IndexExerciseComcheck from './containers/authenticated/exercise/check/Comcheck'
import IndexExerciseLessons from './containers/authenticated/exercise/lessons/Index'
import Immutable from 'seamless-immutable'
import roundMoment from './utils/Moment-round'

injectTapEventPlugin()
roundMoment()

//Default application state
const initialState = {
  app: Immutable({logged: JSON.parse(localStorage.getItem('logged')), worker: {status: 'RUNNING'}}),
  screen: Immutable({navbar_left_open: false, navbar_right_open: true}),
  referential: entitiesInitializer
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
  const createLogger = require(`redux-logger`);
  store = createStore(rootReducer, initialState, compose(
    applyMiddleware(routingMiddleware, thunk, createLogger({
      predicate: (getState, action) => !action.type.startsWith('DATA_FETCH') && !action.type.startsWith('@@redux-form')
    })),
    window.devToolsExtension && window.devToolsExtension()
  ))
} else {
  store = createStore(rootReducer, initialState, applyMiddleware(routingMiddleware, thunk))
}

//Axios API
export const api = (schema) => {
  var token = R.path(['logged', 'auth'], store.getState().app)
  const instance = axios.create({headers: {'Authorization': token}})
  //Intercept to apply schema and test unauthorized users
  instance.interceptors.response.use(function (response) {
    var dataNormalize = Immutable(schema ? normalize(response.data, schema) : response.data)
    debug("api", {from: response.request.responseURL, data: {raw: response.data, normalize: dataNormalize}})
    response.data = dataNormalize
    return response
  }, function (err) {
    let res = err.response;
    console.error("api", res)
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
})

const PlatformWorkerAccessible = UserAuthWrapper({
  authSelector: state => state.app.worker,
  predicate: worker => worker.status === "RUNNING",
  failureRedirectPath: '/unreachable',
  allowRedirectBack: false
})

const PlatformWorkerNotAccessible = UserAuthWrapper({
  authSelector: state => state.app.worker,
  predicate: worker => worker.status !== "RUNNING",
  failureRedirectPath: '/private',
  allowRedirectBack: false
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

class IntlWrapper extends Component {
  render () {
    const { children, lang } = this.props
    return <IntlProvider locale={lang} key={lang} messages={i18n.messages[lang]}>{children}</IntlProvider>
  }
}

IntlWrapper.propTypes = {
  lang: PropTypes.string,
  children: PropTypes.node
}

const select = (state) => {
    var lang = R.pathOr("auto", ['logged', 'lang'], state.app)
    return {lang: lang === "auto" ?  locale : lang}
}

const ConnectedIntl = connect(select)(IntlWrapper)

addLocaleData([...enLocaleData, ...frLocaleData]);
class App extends Component {
  render() {
    return (
      <ConnectedIntl store={store}>
        <MuiThemeProvider muiTheme={getMuiTheme(theme)}>
          <Provider store={store}>
            <Router history={history}>
              <Route path='/' component={RootAnonymous}>
                <IndexRoute component={UserIsNotAuthenticated(Login)}/>
                <Route path='/login' component={UserIsNotAuthenticated(Login)}/>
                <Route path='/comcheck/:statusId' component={IndexComcheck}/>
                <Route path='/unreachable' component={PlatformWorkerNotAccessible(NoWorker)}/>
              </Route>
              <Route path='/private' component={PlatformWorkerAccessible(UserIsAuthenticated(RootAuthenticated))}>
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
                  <Route path='execution' component={IndexExerciseExecution}/>
                  <Route path='lessons' component={IndexExerciseLessons}/>
                  <Route path='checks' component={IndexExerciseChecks}/>
                  <Route path='checks/dryrun/:dryrunId' component={IndexExerciseDryrun}/>
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
      </ConnectedIntl>
    )
  }
}

export default App
