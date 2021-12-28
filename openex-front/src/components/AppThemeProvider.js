import React from 'react';
import * as PropTypes from 'prop-types';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import * as R from 'ramda';
import { connect } from 'react-redux';
import themeDark from './ThemeDark';
import themeLight from './ThemeLight';

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
  const platformTheme = R.pathOr('auto', ['parameters', 'theme'], state.app);
  const userTheme = R.pathOr('auto', ['logged', 'theme'], state.app);
  return { platformTheme, userTheme };
};

// eslint-disable-next-line import/prefer-default-export
export const ConnectedThemeProvider = connect(select)(AppThemeProvider);
