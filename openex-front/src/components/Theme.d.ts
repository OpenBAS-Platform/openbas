import { PaletteColorOptions, PaletteOptions, TypeBackground } from '@mui/material';
import { Theme as MuiTheme } from '@mui/material/styles/createTheme';

interface ExtendedColor extends PaletteColorOptions {
  main: string;
}

interface ExtendedBackground extends TypeBackground {
  nav: string;
}

interface ExtendedPaletteOptions extends PaletteOptions {
  background: Partial<ExtendedBackground>;
  primary: Partial<ExtendedColor>;
}

export interface Theme extends MuiTheme {
  palette: ExtendedPaletteOptions;
}
