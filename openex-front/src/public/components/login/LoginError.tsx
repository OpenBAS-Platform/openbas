import { FunctionComponent } from 'react';
import { useLocation } from 'react-router-dom';
import { makeStyles } from '@mui/styles';
import { Theme as MuiTheme } from '@mui/material/styles/createTheme';

const useStyles = makeStyles<MuiTheme>((theme) => ({
  errorColor: {
    color: theme.palette.error.main,
  },
}));

const LoginError: FunctionComponent = () => {
  const classes = useStyles();
  const { search } = useLocation();
  const error = search.substring(search.indexOf('error=') + 'error='.length);

  return (
    <div className={classes.errorColor}>{decodeURIComponent(error)}</div>
  );
};

export default LoginError;
