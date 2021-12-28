import React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { StyledEngineProvider } from '@mui/material/styles';
import { ConnectedThemeProvider } from '../components/AppThemeProvider';
import { ConnectedIntlProvider } from '../components/AppIntlProvider';
import Login from './components/Login';

const Root = () => (
  <StyledEngineProvider injectFirst={true}>
    <ConnectedThemeProvider>
      <CssBaseline />
      <ConnectedIntlProvider>
        <Login />
      </ConnectedIntlProvider>
    </ConnectedThemeProvider>
  </StyledEngineProvider>
);

export default Root;
