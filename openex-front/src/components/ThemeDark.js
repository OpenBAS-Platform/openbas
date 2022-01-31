export default () => ({
  fontFamily: 'Roboto, sans-serif',
  palette: {
    mode: 'dark',
    primary: {
      main: '#00b1ff',
    },
    secondary: {
      main: '#e91e63',
    },
    background: {
      default: '#0a1929',
      paper: '#001e3c',
      header: '#071a2e',
      area: '#',
    },
  },
  typography: {
    body2: {
      fontSize: '0.8rem',
    },
    body1: {
      fontSize: '0.9rem',
    },
    overline: {
      fontWeight: 500,
    },
    h1: {
      margin: '0 0 10px 0',
      padding: 0,
      color: '#00b1ff',
      fontWeight: 400,
      fontSize: 13,
    },
    h2: {
      margin: '0 0 10px 0',
      padding: 0,
      color: '#00b1ff',
      fontWeight: 600,
      fontSize: 16,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: '#6b6b6b #2b2b2b',
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            backgroundColor: '#001e3c',
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            borderRadius: 8,
            backgroundColor: '#01478DFF',
            minHeight: 24,
            border: '3px solid #001e3c',
          },
          '&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus':
            {
              backgroundColor: '#01478DFF',
            },
          '&::-webkit-scrollbar-thumb:active, & *::-webkit-scrollbar-thumb:active':
            {
              backgroundColor: '#01478DFF',
            },
          '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover':
            {
              backgroundColor: '#01478DFF',
            },
          '&::-webkit-scrollbar-corner, & *::-webkit-scrollbar-corner': {
            backgroundColor: '#01478DFF',
          },
          html: {
            WebkitFontSmoothing: 'auto',
          },
          a: {
            color: '#00b1ff',
          },
          'input:-webkit-autofill': {
            WebkitAnimation: 'autofill 0s forwards',
            animation: 'autofill 0s forwards',
            WebkitTextFillColor: '#ffffff !important',
            caretColor: 'transparent !important',
            WebkitBoxShadow:
              '0 0 0 1000px rgba(4, 8, 17, 0.88) inset !important',
            borderTopLeftRadius: 'inherit',
            borderTopRightRadius: 'inherit',
          },
          pre: {
            color: '#ffffff !important',
            background: '#01478DFF !important',
          },
          code: {
            color: '#ffffff !important',
            background: '#01478DFF !important',
          },
          '.react-mde': {
            border: '0 !important',
            borderBottom: '1px solid #b9bfc1 !important',
            '&:hover': {
              borderBottom: '2px solid #ffffff !important',
              marginBottom: '-1px !important',
            },
          },
          '.error .react-mde': {
            border: '0 !important',
            borderBottom: '2px solid #f44336 !important',
            marginBottom: '-1px !important',
            '&:hover': {
              border: '0 !important',
              borderBottom: '2px solid #f44336 !important',
              marginBottom: '-1px !important',
            },
          },
          '.mde-header': {
            border: '0 !important',
            backgroundColor: 'transparent !important',
            color: '#ffffff !important',
          },
          '.mde-header-item button': {
            color: '#ffffff !important',
          },
          '.mde-tabs button': {
            color: '#ffffff !important',
          },
          '.mde-textarea-wrapper textarea': {
            color: '#ffffff',
            backgroundColor: '#14262c',
          },
          '.react-grid-placeholder': {
            backgroundColor: 'rgba(0, 188, 212, 0.8) !important',
          },
          '.react_time_range__track': {
            backgroundColor: 'rgba(1, 226, 255, 0.1) !important',
            borderLeft: '1px solid #00bcd4 !important',
            borderRight: '1px solid #00bcd4 !important',
          },
          '.react_time_range__handle_marker': {
            backgroundColor: '#00bcd4 !important',
          },
          '.leaflet-container': {
            backgroundColor: '#0a1929 !important',
          },
        },
      },
    },
  },
});
