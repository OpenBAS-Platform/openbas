import { makeStyles } from '@mui/styles';
import React, { Suspense, lazy } from 'react';
import { Route, Routes, useLocation, useParams } from 'react-router-dom';
import { fetchExercise } from '../../../actions/Exercise';
import { fetchTags } from '../../../actions/Tag';
import type { ExercicesHelper } from '../../../actions/helper';
import { errorWrapper } from '../../../components/Error';
import Loader from '../../../components/Loader';
import { useHelper } from '../../../store';
import useDataLoader from '../../../utils/ServerSideEvent';
import { useAppDispatch } from '../../../utils/hooks';
import TopBar from '../nav/TopBar';
import ExerciseHeader from './ExerciseHeader';

const Exercise = lazy(() => import('./Exercise'));
const Dryrun = lazy(() => import('./controls/Dryrun'));
const Comcheck = lazy(() => import('./controls/Comcheck'));
const Dashboard = lazy(() => import('./dashboard/Dashboard'));
const Lessons = lazy(() => import('./lessons/Lessons'));
const Reports = lazy(() => import('./reports/Reports'));
const Report = lazy(() => import('./reports/Report'));
const Teams = lazy(() => import('./teams/Teams'));
const Injects = lazy(() => import('./injects/Injects'));
const Articles = lazy(() => import('./articles/ExerciseArticles'));
const Challenges = lazy(() => import('./challenges/Challenges'));
const Timeline = lazy(() => import('./timeline/Timeline'));
const Mails = lazy(() => import('./mails/Mails'));
const MailsInject = lazy(() => import('./mails/Inject'));
const Logs = lazy(() => import('./logs/Logs'));
const Chat = lazy(() => import('./chat/Chat'));
const Validations = lazy(() => import('./validations/Validations'));
const Variables = lazy(() => import('./variables/ExerciseVariables'));

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
    if (location.pathname.includes('/definition') || location.pathname.includes('/animation') || location.pathname.includes('/results')) {
      withPadding = true;
    }
    return (
      <div className={classes.root}>
        <TopBar />
        <ExerciseHeader withPadding={withPadding} />
        <div className="clearfix" />
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="" element={errorWrapper(Exercise)()} />
            <Route path="controls/dryruns/:dryrunId" element={errorWrapper(Dryrun)()} />
            <Route path="controls/comchecks/:comcheckId" element={errorWrapper(Comcheck)()} />
            <Route path="definition/teams" element={errorWrapper(Teams)()} />
            <Route path="definition/articles" element={errorWrapper(Articles)()} />
            <Route path="definition/challenges" element={errorWrapper(Challenges)()} />
            <Route path="definition/variables" element={errorWrapper(Variables)()} />
            <Route path="scenario" element={errorWrapper(Injects)()} />
            <Route path="animation/timeline" element={errorWrapper(Timeline)()} />
            <Route path="animation/mails" element={errorWrapper(Mails)()} />
            <Route path="animation/mails/:injectId" element={errorWrapper(MailsInject)()} />
            <Route path="animation/logs" element={errorWrapper(Logs)()} />
            <Route path="animation/chat" element={errorWrapper(Chat)()} />
            <Route path="animation/validations" element={errorWrapper(Validations)()} />
            <Route path="results/dashboard" element={errorWrapper(Dashboard)()} />
            <Route path="results/lessons" element={errorWrapper(Lessons)()} />
            <Route path="results/reports" element={errorWrapper(Reports)()} />
            <Route path="results/reports/:reportId" element={errorWrapper(Report)()} />
          </Routes>
        </Suspense>
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
