import React from 'react';
import '@fontsource/ibm-plex-sans';
import '@fontsource/geologica';
import { createRoot } from 'react-dom/client';
import '@xyflow/react/dist/style.css';
import App from './app';
import './static/css/index.css';
import './static/css/CKEditorDark.css';
import './static/css/CKEditorLight.css';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}
