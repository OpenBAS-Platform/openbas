import {registerPolyfills} from './utils/Polyfill'
registerPolyfills()

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import '../public/css/main.css'

ReactDOM.render(
  <App />,
  document.getElementById('root')
);