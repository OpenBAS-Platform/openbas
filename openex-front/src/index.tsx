import 'typeface-ibm-plex-sans';
import 'typeface-roboto';
import React from 'react';
import './resources/css/main.css';
import './resources/css/leaflet.css';
import 'react-mde/lib/styles/css/react-mde-all.css';
import './resources/css/CKEditorDark.css';
import './resources/css/CKEditorLight.css';
import App from './app';
import { createRoot } from "react-dom/client";

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
