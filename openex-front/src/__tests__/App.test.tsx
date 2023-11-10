import React from 'react';
import { createRoot } from 'react-dom/client';
import App from '../app';

it('renders without crashing', () => {
  const div = document.createElement('div');
  if (div) {
    const root = createRoot(div);
    root.render(<App />);
    root.unmount();
  }
});
