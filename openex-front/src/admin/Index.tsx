import React, { Suspense, lazy } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { useTheme, makeStyles } from '@mui/styles';
import { Box } from '@mui/material';
import TopBar from './components/nav/TopBar';
import LeftBar from './components/nav/LeftBar';
import Message from '../components/Message';
import { errorWrapper } from '../components/Error';
import useDataLoader from '../utils/ServerSideEvent';
import { useHelper } from '../store';
import type { Theme } from '../components/Theme';
import type { LoggedHelper } from '../actions/helper';
import Loader from '../components/Loader';

const IndexExercise = lazy(() => import('./components/exercises/Index'));
const Dashboard = lazy(() => import('./components/Dashboard'));
const IndexProfile = lazy(() => import('./components/profile/Index'));
const Exercises = lazy(() => import('./components/exercises/Exercises'));
const Persons = lazy(() => import('./components/persons/Index'));
const Organizations = lazy(() => import('./components/organizations/Organizations'));
const Medias = lazy(() => import('./components/medias'));
const IndexIntegrations = lazy(() => import('./components/integrations/Index'));
const Challenges = lazy(() => import('./components/challenges/Challenges'));
const LessonsTemplates = lazy(() => import('./components/lessons/LessonsTemplates'));
const IndexLessonsTemplate = lazy(() => import('./components/lessons/Index'));
const IndexSettings = lazy(() => import('./components/settings/Index'));

const useStyles = makeStyles<Theme>((theme) => ({
  toolbar: theme.mixins.toolbar,
}));

const Index = () => {
  const theme = useTheme<Theme>();
  const classes = useStyles();
  const navigate = useNavigate();
  const logged = useHelper((helper: LoggedHelper) => helper.logged());

  if (logged.isOnlyPlayer) {
    navigate('/private');
  }
  const boxSx = {
    flexGrow: 1,
    padding: 3,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
  };
  useDataLoader();
  return (
    <>
      <Box
        sx={{
          display: 'flex',
          minWidth: 1400,
        }}
      >
        <TopBar />
        <LeftBar />
        <Message />
        <Box component="main" sx={boxSx}>
          <div className={classes.toolbar} />
          <Suspense fallback={<Loader />}>
            <Routes>
              <Route path="profile/*" element={errorWrapper(IndexProfile)()} />
              <Route path="exercises" element={errorWrapper(Exercises)()} />
              <Route path="" element={errorWrapper(Dashboard)()} />
              <Route path="exercises/:exerciseId/*" element={errorWrapper(IndexExercise)()} />
              <Route path="persons/*" element={errorWrapper(Persons)()} />
              <Route path="organizations" element={errorWrapper(Organizations)()} />
              <Route path="medias/*" element={errorWrapper(Medias)()} />
              <Route path="challenges" element={errorWrapper(Challenges)()} />
              <Route path="lessons" element={errorWrapper(LessonsTemplates)()} />
              <Route path="lessons/:lessonsTemplateId/*" element={errorWrapper(IndexLessonsTemplate)()} />
              <Route path="integrations/*" element={errorWrapper(IndexIntegrations)()} />
              <Route path="settings/*" element={errorWrapper(IndexSettings)()} />
            </Routes>
          </Suspense>
        </Box>
      </Box>
    </>
  );
};

export default Index;
