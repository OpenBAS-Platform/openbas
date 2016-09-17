import React, {Component} from 'react';
import './App.css';

import {createStore, applyMiddleware, compose} from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './reducers';
import Root from './containers/Root';
import {Provider} from 'react-redux';
import {Router, Route, browserHistory} from 'react-router';
import {syncHistoryWithStore, routerActions, routerMiddleware} from 'react-router-redux'
import { UserAuthWrapper } from 'redux-auth-wrapper'

import {Map, List, fromJS} from 'immutable';

import Login from './components/Login';
import OpenEx from './containers/OpenEx';

const token = localStorage.getItem('token');
const immutableToken = fromJS(JSON.parse(token));
const initialState = {
  application: Map({token: immutableToken}),
  counter: Map({
    count: 0,
    lines: List()
  })
};

console.log(initialState);
const baseHistory = browserHistory
const routingMiddleware = routerMiddleware(baseHistory)
const store = createStore(rootReducer, initialState, compose(
  applyMiddleware(thunk, routingMiddleware),
  window.devToolsExtension && window.devToolsExtension()
));

//Hot reload reducers in dev
if (process.env.NODE_ENV === 'development' && module.hot) {
  module.hot.accept('./reducers', () =>
    store.replaceReducer(require('./reducers').default)
  );
}

// Create an enhanced history that syncs navigation events with the store
const history = syncHistoryWithStore(baseHistory, store)

const UserIsAuthenticated = UserAuthWrapper({
  authSelector: state => state.application.getIn(['token', 'token_user']),
  redirectAction: routerActions.replace,
  wrapperDisplayName: 'UserIsAuthenticated'
})

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <Router history={history}>
          <Route path='/' component={Root}>
            <Route path='/home' component={UserIsAuthenticated(OpenEx)}/>
            <Route path='/login' component={Login}/>
          </Route>
        </Router>
      </Provider>
    );
  }
}

export default App;
