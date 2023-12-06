import React from 'react';
import { Route, Routes, useParams, useLocation } from 'react-router-dom';
import { makeStyles } from '@mui/styles';
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
import Logs from './logs/Logs';
import Chat from './chat/Chat';
import Validations from './validations/Validations';
import Dryrun from './controls/Dryrun';
import Comcheck from './controls/Comcheck';
import Dashboard from './dashboard/Dashboard';
import Lessons from './lessons/Lessons';
import Reports from './reports/Reports';
import { errorWrapper } from '../../../components/Error';
import useDataLoader from '../../../utils/ServerSideEvent';
import { useHelper } from '../../../store';
import Report from './reports/Report';
import Variables from './variables/Variables';
import { ExercicesHelper } from '../../../actions/helper';
import { useAppDispatch } from '../../../utils/hooks';

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
  },
}));

const Index = () => {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const { exerciseId } = useParams();
  const location = useLocation();
  const exercise = useHelper((helper: ExercicesHelper) => helper.getExercise(exerciseId));
  useDataLoader(() => {
    dispatch(fetchTags());
    dispatch(fetchExercise(exerciseId));
  });
  if (exercise) {
    let withPadding = false;
    if (
      location.pathname.includes('/definition')
      || location.pathname.includes('/animation')
      || location.pathname.includes('/results')
    ) {
      withPadding = true;
    }
    return (
      <div className={classes.root}>
        <TopBar />
        <ExerciseHeader withPadding={withPadding} />
        <div className="clearfix" />
        <Routes>
          <Route path="" element={errorWrapper(Exercise)()} />
          <Route
            path="controls/dryruns/:dryrunId"
            element={errorWrapper(Dryrun)()}
          />
          <Route
            path="controls/comchecks/:comcheckId"
            element={errorWrapper(Comcheck)()}
          />
          <Route
            path="definition/audiences"
            element={errorWrapper(Audiences)()}
          />
          <Route path="definition/media" element={errorWrapper(Articles)()} />
          <Route
            path="definition/challenges"
            element={errorWrapper(Challenges)()}
          />
          <Route
            path="definition/variables"
            element={errorWrapper(Variables)()}
          />
          <Route path="scenario" element={errorWrapper(Injects)()} />
          <Route path="animation/timeline" element={errorWrapper(Timeline)()} />
          <Route path="animation/mails" element={errorWrapper(Mails)()} />
          <Route
            path="animation/mails/:injectId"
            element={errorWrapper(MailsInject)()}
          />
          <Route path="animation/logs" element={errorWrapper(Logs)()} />
          <Route path="animation/chat" element={errorWrapper(Chat)()} />
          <Route
            path="animation/validations"
            element={errorWrapper(Validations)()}
          />
          <Route path="results/dashboard" element={errorWrapper(Dashboard)()} />
          <Route path="results/lessons" element={errorWrapper(Lessons)()} />
          <Route path="results/reports" element={errorWrapper(Reports)()} />
          <Route
            path="results/reports/:reportId"
            element={errorWrapper(Report)()}
          />
        </Routes>
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
