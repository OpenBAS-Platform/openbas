import React from 'react';
import { Route, Switch, useParams, useLocation } from 'react-router-dom';
import { makeStyles } from '@mui/styles';
import { useDispatch } from 'react-redux';
import Exercise from './Exercise';
import { fetchExercise } from '../../../actions/Exercise';
import { fetchTags } from '../../../actions/Tag';
import Loader from '../../../components/Loader';
import ExerciseHeader from './ExerciseHeader';
import TopBar from '../nav/TopBar';
import Audiences from './audiences/Audiences';
import Injects from './injects/Injects';
import Articles from './articles/Articles';
import Challenges from './challenges/Challenges';
import Timeline from './timeline/Timeline';
import Mails from './mails/Mails';
import MailsInject from './mails/Inject';
import Chat from './chat/Chat';
import Validations from './validations/Validations';
import Dryrun from './controls/Dryrun';
import Comcheck from './controls/Comcheck';
import Lessons from './lessons/Lessons';
import { errorWrapper } from '../../../components/Error';
import useDataLoader from '../../../utils/ServerSideEvent';
import { useHelper } from '../../../store';

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
  },
}));

const Index = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { exerciseId } = useParams();
  const location = useLocation();
  const exercise = useHelper((helper) => helper.getExercise(exerciseId));
  useDataLoader(() => {
    dispatch(fetchTags());
    dispatch(fetchExercise(exerciseId));
  });
  if (exercise) {
    let withPadding = false;
    if (
      location.pathname.includes('/definition')
      || location.pathname.includes('/animation')
    ) {
      withPadding = true;
    }
    return (
      <div className={classes.root}>
        <TopBar />
        <ExerciseHeader withPadding={withPadding} />
        <div className="clearfix" />
        <Switch>
          <Route
            exact
            path="/admin/exercises/:exerciseId"
            render={errorWrapper(Exercise)}
          />
          <Route
            exact
            path="/admin/exercises/:exerciseId/controls/dryruns/:dryrunId"
            render={errorWrapper(Dryrun)}
          />
          <Route
            exact
            path="/admin/exercises/:exerciseId/controls/comchecks/:comcheckId"
            render={errorWrapper(Comcheck)}
          />
          <Route
            exact
            path="/admin/exercises/:exerciseId/definition/audiences"
            render={errorWrapper(Audiences)}
          />
          <Route
            exact
            path="/admin/exercises/:exerciseId/definition/media"
            render={errorWrapper(Articles)}
          />
          <Route
            exact
            path="/admin/exercises/:exerciseId/definition/challenges"
            render={errorWrapper(Challenges)}
          />
          <Route
            exact
            path="/admin/exercises/:exerciseId/scenario"
            render={errorWrapper(Injects)}
          />
          <Route
            exact
            path="/admin/exercises/:exerciseId/animation/timeline"
            render={errorWrapper(Timeline)}
          />
          <Route
            exact
            path="/admin/exercises/:exerciseId/animation/mails"
            render={errorWrapper(Mails)}
          />
          <Route
            exact
            path="/admin/exercises/:exerciseId/animation/mails/:injectId"
            render={errorWrapper(MailsInject)}
          />
          <Route
            exact
            path="/admin/exercises/:exerciseId/animation/chat"
            render={errorWrapper(Chat)}
          />
          <Route
            exact
            path="/admin/exercises/:exerciseId/animation/validations"
            render={errorWrapper(Validations)}
          />
          <Route
            exact
            path="/admin/exercises/:exerciseId/lessons"
            render={errorWrapper(Lessons)}
          />
        </Switch>
      </div>
    );
  }
  return (
    <div className={classes.root}>
      <TopBar />
      <Loader />
    </div>
  );
};

export default Index;
