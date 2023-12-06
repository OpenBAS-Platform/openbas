import React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { StyledEngineProvider } from '@mui/material/styles';
import ConnectedThemeProvider from '../components/AppThemeProvider';
import ConnectedIntlProvider from '../components/AppIntlProvider';
import Index from './Index';

const Root = () => (
  <StyledEngineProvider injectFirst={true}>
    <ConnectedThemeProvider>
      <CssBaseline />
      <ConnectedIntlProvider>
        <Index />
      </ConnectedIntlProvider>
    </ConnectedThemeProvider>
  </StyledEngineProvider>
);

export default Root;
