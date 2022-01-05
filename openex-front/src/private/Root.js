import React from 'react';
import { useDispatch } from 'react-redux';
import * as R from 'ramda';
import { StyledEngineProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { fetchMe, fetchParameters } from '../actions/Application';
import { ConnectedIntlProvider } from '../components/AppIntlProvider';
import { ConnectedThemeProvider } from '../components/AppThemeProvider';
import RootPublic from '../public/Root';
import Index from './Index';
import useDataLoader from '../utils/ServerSideEvent';
import { useStore } from '../store';

const RootPrivate = () => {
  const dispatch = useDispatch();
  const logged = useStore((store) => store.logged);

  useDataLoader(() => {
    dispatch(fetchMe());
    dispatch(fetchParameters());
  });

  if (R.isEmpty(logged)) {
    return <div />;
  }
  if (!logged) {
    return <RootPublic />;
  }
  return (
    <StyledEngineProvider injectFirst={true}>
      <ConnectedThemeProvider>
        <CssBaseline />
        <ConnectedIntlProvider>
          <Index />
        </ConnectedIntlProvider>
      </ConnectedThemeProvider>
    </StyledEngineProvider>
  );
};

export default RootPrivate;
