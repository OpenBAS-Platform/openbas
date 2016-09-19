import React, {Component} from 'react';
import './App.css';
import axios from 'axios';
import {createStore, applyMiddleware, compose} from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './reducers';
import Root from './containers/Root';
import {Provider} from 'react-redux';
import {Router, Route, IndexRoute, browserHistory} from 'react-router';
import {syncHistoryWithStore, routerActions, routerMiddleware} from 'react-router-redux'
import {UserAuthWrapper} from 'redux-auth-wrapper'
import {Map, fromJS} from 'immutable';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Login from './containers/Login';
import Home from './containers/Home';
import Index from './containers/Index';
import {logger} from './middlewares/Logger'
import {normalize} from 'normalizr'

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

//Auth token
const data = fromJS(JSON.parse(localStorage.getItem('token')));
var tokens = data ? data.getIn(['entities', 'tokens']) : null;
var token = data ? data.get('result') : null;
var users = data ? data.getIn(['entities', 'users']) : null;
var user = tokens ? tokens.get(token.toString()).get('token_user') : null;

const initialState = {
  application: Map({
    user: user && user.toString(),
    token: token && token.toString(),
    entities: Map({
      users: users,
      tokens: tokens
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

const UserIsAuthenticated = UserAuthWrapper({
  authSelector: state => {
    var app = state.application;
    return app.getIn(['entities', 'tokens', app.get('token')])
  },
  redirectAction: routerActions.replace,
  wrapperDisplayName: 'UserIsAuthenticated',
  //TODO check validity token | predicate: token => token
})

class App extends Component {
  render() {
    return (
      <MuiThemeProvider>
        <Provider store={store}>
          <Router history={history}>
            <Route path='/' component={Root}>
              <IndexRoute component={Index}/>
              <Route path='/home' component={UserIsAuthenticated(Home)}/>
              <Route path='/login' component={Login}/>
            </Route>
          </Router>
        </Provider>
      </MuiThemeProvider>
    );
  }
}

export default App;
