import React, { lazy, Suspense } from 'react';
import * as PropTypes from 'prop-types';
import { Route, Routes } from 'react-router-dom';
import { makeStyles } from '@mui/styles';
import { errorWrapper } from '../components/Error';
import Reset from './components/login/Reset';
import type { Theme } from '../components/Theme';
import Loader from '../components/Loader';

const Login = lazy(() => import('./components/login/Login'));
const Comcheck = lazy(() => import('./components/comcheck/Comcheck'));
const Channel = lazy(() => import('./components/channels/Channel'));
const Challenges = lazy(() => import('./components/challenges/Challenges'));
const ExerciseViewLessons = lazy(() => import('./components/lessons/ExerciseViewLessons'));
const ScenarioViewLessons = lazy(() => import('./components/lessons/ScenarioViewLessons'));

const useStyles = makeStyles<Theme>((theme) => ({
  root: {
    minWidth: 1280,
    height: '100%',
    overflowY: 'auto',
  },
  content: {
    height: '100%',
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: 0,
    minWidth: 0,
  },
}));

const Index = () => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <main className={classes.content}>
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="comcheck/:statusId" element={errorWrapper(Comcheck)()} />
            <Route path="reset" element={errorWrapper(Reset)()} />
            <Route path="channels/:exerciseId/:channelId" element={errorWrapper(Channel)()} />
            <Route path="challenges/:exerciseId" element={errorWrapper(Challenges)()} />
            <Route path="lessons/exercise/:exerciseId" element={errorWrapper(ExerciseViewLessons)()} />
            <Route path="lessons/scenario/:scenarioId" element={errorWrapper(ScenarioViewLessons)()} />
            <Route path="*" element={<Login />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
};

Index.propTypes = {
  classes: PropTypes.object,
};

export default Index;
