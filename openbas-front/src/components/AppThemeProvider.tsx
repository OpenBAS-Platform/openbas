import React, { ReactNode, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { ThemeOptions } from '@mui/material/styles/createTheme';
import themeDark from './ThemeDark';
import themeLight from './ThemeLight';
import { useHelper } from '../store';
import type { LoggedHelper } from '../actions/helper';
import type { PlatformSettings } from '../utils/api-types';

interface Props {
  children: ReactNode;
}

const AppThemeProvider: React.FC<Props> = ({
  children,
}) => {
  const { theme, dark, light }: {
    theme: string,
    dark: PlatformSettings['platform_dark_theme'],
    light: PlatformSettings['platform_light_theme']
  } = useHelper((helper: LoggedHelper) => {
    const me = helper.getMe();
    const settings = helper.getSettings();
    const rawPlatformTheme = settings.platform_theme ?? 'auto';
    const rawUserTheme = me?.user_theme ?? 'default';
    return { theme: rawUserTheme !== 'default' ? rawUserTheme : rawPlatformTheme, dark: settings.platform_dark_theme, light: settings.platform_light_theme };
  });
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  });
  let muiTheme = createTheme(
    themeDark(
      dark?.logo_url,
      dark?.logo_url_collapsed,
      dark?.background_color,
      dark?.paper_color,
      dark?.navigation_color,
      dark?.primary_color,
      dark?.secondary_color,
      dark?.accent_color,
    ) as ThemeOptions,
  );
  if (theme === 'light') {
    muiTheme = createTheme(themeLight(
      light?.logo_url,
      light?.logo_url_collapsed,
      light?.background_color,
      light?.paper_color,
      light?.navigation_color,
      light?.primary_color,
      light?.secondary_color,
      light?.accent_color,
    ) as ThemeOptions);
  }
  return <ThemeProvider theme={muiTheme}>{children}</ThemeProvider>;
};

const ConnectedThemeProvider = AppThemeProvider;

export default ConnectedThemeProvider;
