import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { makeStyles } from '@mui/styles';
import TopBar from './components/nav/TopBar';
import Dashboard from './components/Dashboard';
import useDataLoader from '../utils/ServerSideEvent';
import { errorWrapper } from '../components/Error';

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
  useDataLoader();
  return (
    <div className={classes.root}>
      <TopBar />
      <main className={classes.content} style={{ paddingRight: 24 }}>
        <div className={classes.toolbar} />
        <Switch>
          <Route exact path="/private" render={errorWrapper(Dashboard)} />
        </Switch>
      </main>
    </div>
  );
};

export default Index;
