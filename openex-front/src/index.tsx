import 'typeface-ibm-plex-sans';
import 'typeface-roboto';
import React from 'react';
import './resources/css/main.css';
import './resources/css/leaflet.css';
import './resources/css/CKEditorDark.css';
import './resources/css/CKEditorLight.css';
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
