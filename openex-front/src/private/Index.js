import React from 'react';
import * as PropTypes from 'prop-types';
import { Route, Switch } from 'react-router-dom';
import { makeStyles } from '@mui/styles';
import TopBar from './components/nav/TopBar';
import LeftBar from './components/nav/LeftBar';
import NotFound from '../components/NotFound';
import IndexProfile from './components/profile/Index';
import IndexSettings from './components/settings/Index';
import Dashboard from './components/Dashboard';
import Exercises from './components/Exercises';
import Players from './components/Players';
import Organizations from './components/Organizations';

const useStyles = makeStyles((theme) => ({
  root: {
    minWidth: 1280,
    height: '100%',
  },
  content: {
    height: '100%',
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: '24px 24px 24px 204px',
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
      <TopBar />
      <LeftBar />
      <main className={classes.content} style={{ paddingRight: 24 }}>
        <div className={classes.toolbar} />
        <Switch>
          <Route exact path="/" component={Dashboard} />
          <Route exact path="/profile" component={IndexProfile} />
          <Route exact path="/exercises" component={Exercises} />
          <Route exact path="/players" component={Players} />
          <Route exact path="/organizations" component={Organizations} />
          <Route path="/settings" component={IndexSettings} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
};

Index.propTypes = {
  classes: PropTypes.object,
};

export default Index;
