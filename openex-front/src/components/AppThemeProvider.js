import React, { useEffect } from 'react';
import * as PropTypes from 'prop-types';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import themeDark from './ThemeDark';
import themeLight from './ThemeLight';
import { useHelper } from '../store';

const AppThemeProvider = (props) => {
  const { children } = props;
  const theme = useHelper((helper) => {
    const me = helper.getMe();
    const settings = helper.getSettings();
    const rawPlatformTheme = settings.platform_theme ?? 'auto';
    const rawUserTheme = me?.user_theme ?? 'default';
    return rawUserTheme !== 'default' ? rawUserTheme : rawPlatformTheme;
  });
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  });
  let muiTheme = createTheme(themeDark());
  if (theme === 'light') {
    muiTheme = createTheme(themeLight());
  }
  return <ThemeProvider theme={muiTheme}>{children}</ThemeProvider>;
};

AppThemeProvider.propTypes = {
  children: PropTypes.node,
};

export const ConnectedThemeProvider = AppThemeProvider;
