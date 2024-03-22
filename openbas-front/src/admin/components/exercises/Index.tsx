import React, { FunctionComponent, lazy, Suspense } from 'react';
import { Route, Routes, useLocation, useParams, Link, Navigate } from 'react-router-dom';
import { Box, Tabs, Tab } from '@mui/material';
import { fetchExercise } from '../../../actions/Exercise';
import { errorWrapper } from '../../../components/Error';
import Loader from '../../../components/Loader';
import { useHelper } from '../../../store';
import useDataLoader from '../../../utils/ServerSideEvent';
import { useAppDispatch } from '../../../utils/hooks';
import ExerciseHeader from './exercise/ExerciseHeader';
import type { Exercise as ExerciseType } from '../../../utils/api-types';
import { DocumentContext, DocumentContextType, PermissionsContext, PermissionsContextType } from '../components/Context';
import { usePermissions } from '../../../utils/Exercise';
import type { ExercisesHelper } from '../../../actions/exercises/exercise-helper';
import NotFound from '../../../components/NotFound';
import { useFormatter } from '../../../components/i18n';
import Breadcrumbs from '../../../components/Breadcrumbs';

const Exercise = lazy(() => import('./exercise/overview/Exercise'));
const Dryrun = lazy(() => import('./controls/Dryrun'));
const Comcheck = lazy(() => import('./controls/Comcheck'));
const Lessons = lazy(() => import('./lessons/Lessons'));
const ExerciseSettings = lazy(() => import('./exercise/definition/ExerciseSettings'));
const ExerciseTeams = lazy(() => import('./teams/ExerciseTeams'));
const Injects = lazy(() => import('./injects/ExerciseInjects'));
const Articles = lazy(() => import('./articles/ExerciseArticles'));
const Challenges = lazy(() => import('./challenges/ExerciseChallenges'));
const Timeline = lazy(() => import('./timeline/Timeline'));
const Mails = lazy(() => import('./mails/Mails'));
const MailsInject = lazy(() => import('./mails/Inject'));
const Logs = lazy(() => import('./logs/Logs'));
const Chat = lazy(() => import('./chat/Chat'));
const Validations = lazy(() => import('./validations/Validations'));
const Variables = lazy(() => import('./variables/ExerciseVariables'));

const IndexComponent: FunctionComponent<{ exercise: ExerciseType }> = ({
  exercise,
}) => {
  const { t } = useFormatter();
  const location = useLocation();
  const permissionsContext: PermissionsContextType = {
    permissions: usePermissions(exercise.exercise_id),
  };
  const documentContext: DocumentContextType = {
    onInitDocument: () => ({
      document_tags: [],
      document_scenarios: [],
      document_exercises: exercise ? [{ id: exercise.exercise_id, label: exercise.exercise_name }] : [],
    }),
  };
  let tabValue = location.pathname;
  if (location.pathname.includes(`/admin/exercises/${exercise.exercise_id}/definition`)) {
    tabValue = `/admin/exercises/${exercise.exercise_id}/definition`;
  } else if (location.pathname.includes(`/admin/exercises/${exercise.exercise_id}/animation`)) {
    tabValue = `/admin/exercises/${exercise.exercise_id}/animation`;
  } else if (location.pathname.includes(`/admin/exercises/${exercise.exercise_id}/results`)) {
    tabValue = `/admin/exercises/${exercise.exercise_id}/results`;
  }
  return (
    <PermissionsContext.Provider value={permissionsContext}>
      <DocumentContext.Provider value={documentContext}>
        <div style={{ paddingRight: ['/definition', '/results', '/animation'].some((el) => location.pathname.includes(el)) ? 200 : 0 }}>
          <Breadcrumbs variant="object" elements={[
            { label: t('Simulations') },
            { label: exercise.exercise_name, current: true },
          ]}
          />
          <ExerciseHeader />
          <Box
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              marginBottom: 4,
            }}
          >
            <Tabs value={tabValue}>
              <Tab
                component={Link}
                to={`/admin/exercises/${exercise.exercise_id}`}
                value={`/admin/exercises/${exercise.exercise_id}`}
                label={t('Overview')}
              />
              <Tab
                component={Link}
                to={`/admin/exercises/${exercise.exercise_id}/definition`}
                value={`/admin/exercises/${exercise.exercise_id}/definition`}
                label={t('Definition')}
              />
              <Tab
                component={Link}
                to={`/admin/exercises/${exercise.exercise_id}/injects`}
                value={`/admin/exercises/${exercise.exercise_id}/injects`}
                label={t('Injects')}
              />
              <Tab
                component={Link}
                to={`/admin/exercises/${exercise.exercise_id}/animation`}
                value={`/admin/exercises/${exercise.exercise_id}/animation`}
                label={t('Animation')}
              />
              <Tab
                component={Link}
                to={`/admin/exercises/${exercise.exercise_id}/lessons`}
                value={`/admin/exercises/${exercise.exercise_id}/lessons`}
                label={t('Lessons learned')}
              />
            </Tabs>
          </Box>
          <Suspense fallback={<Loader />}>
            <Routes>
              <Route path="" element={errorWrapper(Exercise)()} />
              <Route path="controls/dryruns/:dryrunId" element={errorWrapper(Dryrun)()} />
              <Route path="controls/comchecks/:comcheckId" element={errorWrapper(Comcheck)()} />
              <Route path="definition" element={<Navigate to="settings" replace/>}/>
              <Route path="definition/settings" element={errorWrapper(ExerciseSettings)()} />
              <Route path="definition/teams" element={errorWrapper(ExerciseTeams)({ exerciseTeamsUsers: exercise.exercise_teams_users })} />
              <Route path="definition/articles" element={errorWrapper(Articles)()} />
              <Route path="definition/challenges" element={errorWrapper(Challenges)()} />
              <Route path="definition/variables" element={errorWrapper(Variables)()} />
              <Route path="injects" element={errorWrapper(Injects)()} />
              <Route path="animation" element={<Navigate to="timeline" replace={true}/>}/>
              <Route path="animation/timeline" element={errorWrapper(Timeline)()} />
              <Route path="animation/mails" element={errorWrapper(Mails)()} />
              <Route path="animation/mails/:injectId" element={errorWrapper(MailsInject)()} />
              <Route path="animation/logs" element={errorWrapper(Logs)()} />
              <Route path="animation/chat" element={errorWrapper(Chat)()} />
              <Route path="animation/validations" element={errorWrapper(Validations)()} />
              <Route path="lessons" element={errorWrapper(Lessons)()} />
              {/* Not found */}
              <Route path="*" element={<NotFound/>}/>
            </Routes>
          </Suspense>
        </div>
      </DocumentContext.Provider>
    </PermissionsContext.Provider>
  );
};

const Index = () => {
  // Standard hooks
  const dispatch = useAppDispatch();
  // Fetching data
  const { exerciseId } = useParams() as { exerciseId: ExerciseType['exercise_id'] };
  const exercise = useHelper((helper: ExercisesHelper) => helper.getExercise(exerciseId));
  useDataLoader(() => {
    dispatch(fetchExercise(exerciseId));
  });
  if (exercise) {
    return <IndexComponent exercise={exercise} />;
  }
  return <Loader />;
};

export default Index;
