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
import { normalize } from 'normalizr'

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

//Auth token
const localToken = localStorage.getItem('token');
const data = JSON.parse(localToken);
var token = data ? fromJS(data.entities.tokens[data.result]) : null;
var user = data ? fromJS(data.entities.users[token.get('token_user')]) : null;

const initialState = {
  application: Map({token, user}),
  users: Map({data: Map(), loading: false})
};

const baseHistory = browserHistory
const routingMiddleware = routerMiddleware(baseHistory)
const store = createStore(rootReducer, initialState, compose(
  applyMiddleware(routingMiddleware, thunk, logger),
  window.devToolsExtension && window.devToolsExtension()
));

export const api = (schema) => {
  return axios.create({
    responseType: 'json',
    transformResponse: [function (data) {
      return schema ?  normalize(data, schema) : data;
    }],
    headers: {'X-Auth-Token': store.getState().application.getIn(['token', 'token_value'])}
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
  authSelector: state => state.application.getIn(['user']),
  redirectAction: routerActions.replace,
  wrapperDisplayName: 'UserIsAuthenticated'
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
