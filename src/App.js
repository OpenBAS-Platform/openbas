import React, {Component} from 'react';
import logo from './logo.svg';
import './App.css';

import {createStore} from 'redux';
import rootReducer from './reducers';
import CepApp from './CepApp';
import {Provider} from 'react-redux';
import {Map, List} from 'immutable';

const initialState = Map({
  counter: Map({
    count: 0,
    lines: List()
  }),
});

const store = createStore(rootReducer, initialState,
  window.devToolsExtension && window.devToolsExtension()
);

//Hot reload reducers in dev
if (process.env.NODE_ENV === 'development' && module.hot) {
  module.hot.accept('./reducers', () =>
    store.replaceReducer(require('./reducers').default)
  );
}

class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <div className="App">
          <div className="App-header">
            <img src={logo} className="App-logo" alt="logo"/>
            <h2>Welcome to CEP</h2>
          </div>
          <CepApp/>
        </div>
      </Provider>
    );
  }
}

export default App;
