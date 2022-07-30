import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import * as R from 'ramda';
import { Redirect, Route, Switch } from 'react-router-dom';
import { StyledEngineProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import RootPublic from './public/Root';
import IndexAdmin from './admin/Index';
import IndexPrivate from './private/Index';
import { useHelper } from './store';
import { fetchMe, fetchParameters } from './actions/Application';
import NotFound from './components/NotFound';
import { ConnectedThemeProvider } from './components/AppThemeProvider';
import { ConnectedIntlProvider } from './components/AppIntlProvider';
import { errorWrapper } from './components/Error';

const Root = () => {
  const logged = useHelper((helper) => helper.logged());
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchMe());
    dispatch(fetchParameters());
  }, []);
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
          <Switch>
            <Route
              exact
              path="/"
              render={() => (
                <Redirect to={logged.isOnlyPlayer ? '/private' : '/admin'} />
              )}
            />
            <Route path="/private" render={errorWrapper(IndexPrivate)} />
            <Route path="/admin" render={errorWrapper(IndexAdmin)} />
            <Route component={NotFound} />
          </Switch>
        </ConnectedIntlProvider>
      </ConnectedThemeProvider>
    </StyledEngineProvider>
  );
};

export default Root;
