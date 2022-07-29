import 'typeface-ibm-plex-sans';
import 'typeface-roboto';
import React from 'react';
import ReactDOM from 'react-dom';
import './resources/css/main.css';
import './resources/css/leaflet.css';
import 'react-mde/lib/styles/css/react-mde-all.css';
import App from './app';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root'),
);
