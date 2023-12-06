import 'typeface-ibm-plex-sans';
import 'typeface-roboto';
import React from 'react';
import './static/css/main.css';
import './static/css/leaflet.css';
import './static/css/CKEditorDark.css';
import './static/css/CKEditorLight.css';
import { createRoot } from 'react-dom/client';
import App from './app';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
