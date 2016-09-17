import React, {Component} from 'react';
import './App.css';

import {createStore, applyMiddleware, compose} from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './reducers';
import Root from './containers/Root';
import {Provider} from 'react-redux';
import {Router, Route, browserHistory} from 'react-router';
import {syncHistoryWithStore} from 'react-router-redux'

import {Map, List} from 'immutable';

import Login from './components/Login';
import OpenEx from './containers/OpenEx';

const initialState = {
  application: Map(),
  counter: Map({
    count: 0,
    lines: List()
  })
};

const store = createStore(rootReducer, initialState, compose(
  applyMiddleware(thunk),
  window.devToolsExtension && window.devToolsExtension()
));

//Hot reload reducers in dev
if (process.env.NODE_ENV === 'development' && module.hot) {
  module.hot.accept('./reducers', () =>
    store.replaceReducer(require('./reducers').default)
  );
}

// Create an enhanced history that syncs navigation events with the store
const history = syncHistoryWithStore(browserHistory, store)

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <Router history={history}>
          <Route path='/' component={Root}>
            <Route path='/home' component={OpenEx}/>
            <Route path='/login' component={Login}/>
          </Route>
        </Router>
      </Provider>
    );
  }
}

export default App;
