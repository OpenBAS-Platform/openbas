import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { makeStyles } from '@mui/styles';
import TopBar from './components/nav/TopBar';
import LeftBar from './components/nav/LeftBar';
import NotFound from '../components/NotFound';
import Message from '../components/Message';
import IndexProfile from './components/profile/Index';
import Dashboard from './components/Dashboard';
import Exercises from './components/exercises/Exercises';
import IndexExercise from './components/exercises/Index';
import Players from './components/players/Players';
import Organizations from './components/organizations/Organizations';
import Documents from './components/documents/Documents';
import IndexIntegrations from './components/integrations/Index';
import { errorWrapper } from '../components/Error';
import IndexSettings from './components/settings/Index';

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
      <Message />
      <main className={classes.content} style={{ paddingRight: 24 }}>
        <div className={classes.toolbar} />
        <Switch>
          <Route exact path="/" render={errorWrapper(Dashboard)} />
          <Route path="/profile" render={errorWrapper(IndexProfile)} />
          <Route exact path="/exercises" render={errorWrapper(Exercises)} />
          <Route path="/exercises/:exerciseId" render={errorWrapper(IndexExercise)} />
          <Route exact path="/players" render={errorWrapper(Players)} />
          <Route exact path="/organizations" render={errorWrapper(Organizations)} />
          <Route exact path="/documents" render={errorWrapper(Documents)} />
          <Route exact path="/integrations" render={errorWrapper(IndexIntegrations)} />
          <Route path="/settings" render={errorWrapper(IndexSettings)} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
};

export default Index;
