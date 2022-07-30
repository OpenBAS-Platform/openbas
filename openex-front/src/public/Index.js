import React from 'react';
import * as PropTypes from 'prop-types';
import { Route, Switch } from 'react-router-dom';
import { makeStyles } from '@mui/styles';
import Comcheck from './components/comcheck/Comcheck';
import Login from './components/login/Login';
import { errorWrapper } from '../components/Error';
import Media from './components/media/Media';

const useStyles = makeStyles((theme) => ({
  root: {
    minWidth: 1280,
    height: '100%',
  },
  content: {
    height: '100%',
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: 0,
    minWidth: 0,
  },
  message: {
    display: 'flex',
    alignItems: 'center',
  },
  messageIcon: {
    marginRight: theme.spacing(1),
  },
  toolbar: theme.mixins.toolbar,
}));

const Index = () => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <main className={classes.content}>
        <Switch>
          <Route
            exact
            path="/comcheck/:statusId"
            render={errorWrapper(Comcheck)}
          />
          <Route
            path="/media/:exerciseId/:mediaId"
            render={errorWrapper(Media)}
          />
          <Route component={Login} />
        </Switch>
      </main>
    </div>
  );
};

Index.propTypes = {
  classes: PropTypes.object,
};

export default Index;
