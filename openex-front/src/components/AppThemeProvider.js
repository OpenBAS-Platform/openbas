import React from 'react';
import * as PropTypes from 'prop-types';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import * as R from 'ramda';
import { connect } from 'react-redux';
import themeDark from './ThemeDark';
import themeLight from './ThemeLight';
import { storeBrowser } from '../actions/Schema';

const AppThemeProvider = (props) => {
  const { children, userTheme, platformTheme } = props;
  const theme = userTheme !== 'default' ? userTheme : platformTheme;
  let muiTheme = createTheme(themeDark());
  if (theme === 'light') {
    muiTheme = createTheme(themeLight());
  }
  return <ThemeProvider theme={muiTheme}>{children}</ThemeProvider>;
};

AppThemeProvider.propTypes = {
  platformTheme: PropTypes.string,
  userTheme: PropTypes.string,
  children: PropTypes.node,
};

const select = (state) => {
  const browser = storeBrowser(state);
  const { settings, me } = browser;
  const platformTheme = R.propOr('auto', 'platform_theme', settings);
  const userTheme = R.propOr('auto', 'user_theme', me);
  return { platformTheme, userTheme };
};

// eslint-disable-next-line import/prefer-default-export
export const ConnectedThemeProvider = connect(select)(AppThemeProvider);
