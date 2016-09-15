import React, {Component} from 'react';
import logo from './logo.svg';
import './App.css';

import {createStore} from 'redux';
import rootReducer from './reducers';
import CepApp from './CepApp';
import {Provider} from 'react-redux';

const store = createStore(rootReducer);

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
