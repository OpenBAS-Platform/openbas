import 'typeface-ibm-plex-sans';
import 'typeface-roboto';
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './app';
import './static/css/main.css';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
