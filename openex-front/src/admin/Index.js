import React from 'react';
import { Route, Switch, useHistory } from 'react-router-dom';
import { makeStyles } from '@mui/styles';
import TopBar from './components/nav/TopBar';
import LeftBar from './components/nav/LeftBar';
import Message from '../components/Message';
import IndexProfile from './components/profile/Index';
import Dashboard from './components/Dashboard';
import Exercises from './components/exercises/Exercises';
import IndexExercise from './components/exercises/Index';
import Players from './components/players/Players';
import Organizations from './components/organizations/Organizations';
import Documents from './components/documents/Documents';
import Medias from './components/medias/Medias';
import IndexMedia from './components/medias/Index';
import IndexIntegrations from './components/integrations/Index';
import { errorWrapper } from '../components/Error';
import IndexSettings from './components/settings/Index';
import useDataLoader from '../utils/ServerSideEvent';
import { useHelper } from '../store';
import Challenges from './components/challenges/Challenges';
import LessonsTemplates from './components/lessons/LessonsTemplates';
import IndexLessonsTemplate from './components/lessons/Index';

const useStyles = makeStyles((theme) => ({
  root: {
    minWidth: 1280,
    height: '100%',
  },
  content: {
    height: '100%',
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: '24px 24px 24px 214px',
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
  const history = useHistory();
  const logged = useHelper((helper) => helper.logged());
  if (logged.isOnlyPlayer) {
    history.push('/private');
  }
  useDataLoader();
  return (
    <div className={classes.root}>
      <TopBar />
      <LeftBar />
      <Message />
      <main className={classes.content} style={{ paddingRight: 24 }}>
        <div className={classes.toolbar} />
        <Switch>
          <Route exact path="/admin" render={errorWrapper(Dashboard)} />
          <Route path="/admin/profile" render={errorWrapper(IndexProfile)} />
          <Route
            exact
            path="/admin/exercises"
            render={errorWrapper(Exercises)}
          />
          <Route
            path="/admin/exercises/:exerciseId"
            render={errorWrapper(IndexExercise)}
          />
          <Route exact path="/admin/players" render={errorWrapper(Players)} />
          <Route
            exact
            path="/admin/organizations"
            render={errorWrapper(Organizations)}
          />
          <Route
            exact
            path="/admin/documents"
            render={errorWrapper(Documents)}
          />
          <Route exact path="/admin/medias" render={errorWrapper(Medias)} />
          <Route
            path="/admin/medias/:mediaId"
            render={errorWrapper(IndexMedia)}
          />
          <Route
            exact
            path="/admin/challenges"
            render={errorWrapper(Challenges)}
          />
          <Route
            exact
            path="/admin/lessons"
            render={errorWrapper(LessonsTemplates)}
          />
          <Route
              path="/admin/lessons/:lessonsTemplateId"
              render={errorWrapper(IndexLessonsTemplate)}
          />
          <Route
            exact
            path="/admin/integrations"
            render={errorWrapper(IndexIntegrations)}
          />
          <Route path="/admin/settings" render={errorWrapper(IndexSettings)} />
        </Switch>
      </main>
    </div>
  );
};

export default Index;
