import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import * as PropTypes from 'prop-types';
import * as R from 'ramda';
import { StyledEngineProvider } from '@mui/material/styles';
import { withRouter } from 'react-router-dom';
import CssBaseline from '@mui/material/CssBaseline';
import { fetchMe, fetchParameters } from '../actions/Application';
import { ConnectedIntlProvider } from '../components/AppIntlProvider';
import { ConnectedThemeProvider } from '../components/AppThemeProvider';
import RootPublic from '../public/Root';
import Index from './Index';

const RootPrivate = (props) => {
  useEffect(() => {
    props.fetchMe();
    props.fetchParameters();
  }, []);
  if (R.isEmpty(props.logged)) {
    return <div />;
  }
  if (!props.logged) {
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

RootPrivate.propTypes = {
  children: PropTypes.node,
  fetchMe: PropTypes.func,
  fetchParameters: PropTypes.func,
};

const select = (state) => ({
  logged: state.app.logged,
});

export default R.compose(
  connect(select, { fetchMe, fetchParameters }),
  withRouter,
)(RootPrivate);
