import React, { FunctionComponent, lazy, Suspense } from 'react';
import { Route, Routes, useLocation, useParams } from 'react-router-dom';
import { fetchExercise } from '../../../actions/Exercise';
import type { ExercicesHelper } from '../../../actions/helper';
import { errorWrapper } from '../../../components/Error';
import Loader from '../../../components/Loader';
import { useHelper } from '../../../store';
import useDataLoader from '../../../utils/ServerSideEvent';
import { useAppDispatch } from '../../../utils/hooks';
import TopBar from '../nav/TopBar';
import ExerciseHeader from './ExerciseHeader';
import ExerciseOrScenarioContext, { ExerciseOrScenario } from '../../ExerciseOrScenarioContext';
import { usePermissions } from '../../../utils/Exercise';
import type { ArticleCreateInput, ArticleUpdateInput, Exercise, Variable, VariableInput } from '../../../utils/api-types';
import { addVariableForExercise, deleteVariableForExercise, updateVariableForExercise } from '../../../actions/variables/variable-actions';
import type { ArticleStore, FullArticleStore } from '../../../actions/channels/Article';
import { addExerciseArticle, deleteExerciseArticle, updateExerciseArticle } from '../../../actions/channels/article-action';

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
const Challenges = lazy(() => import('./challenges/ExerciseChallenges'));
const Timeline = lazy(() => import('./timeline/Timeline'));
const Mails = lazy(() => import('./mails/Mails'));
const MailsInject = lazy(() => import('./mails/Inject'));
const Logs = lazy(() => import('./logs/Logs'));
const Chat = lazy(() => import('./chat/Chat'));
const Validations = lazy(() => import('./validations/Validations'));
const Variables = lazy(() => import('./variables/ExerciseVariables'));

const IndexComponent: FunctionComponent<{ exercise: Exercise }> = ({
  exercise,
}) => {
  // Standard hooks
  const dispatch = useAppDispatch();

  const context: ExerciseOrScenario = {
    permissions: usePermissions(exercise.exercise_id),

    previewArticleUrl: (article: FullArticleStore) => `/channels/${exercise.exercise_id}/${article.article_fullchannel.channel_id}?preview=true`,
    onAddArticle: (data: ArticleCreateInput) => dispatch(addExerciseArticle(exercise.exercise_id, data)),
    onUpdateArticle: (article: ArticleStore, data: ArticleUpdateInput) => dispatch(
      updateExerciseArticle(exercise.exercise_id, article.article_id, data),
    ),
    onDeleteArticle: (article: ArticleStore) => dispatch(
      deleteExerciseArticle(exercise.exercise_id, article.article_id),
    ),

    previewChallengeUrl: () => `/challenges/${exercise.exercise_id}?preview=true`,

    onInitDocument: () => ({
      document_tags: [],
      document_exercises: [{ id: exercise.exercise_id, label: exercise.exercise_name }],
      document_scenarios: [],
    }),

    onCreateVariable: (data: VariableInput) => dispatch(addVariableForExercise(exercise.exercise_id, data)),
    onEditVariable: (variable: Variable, data: VariableInput) => dispatch(updateVariableForExercise(exercise.exercise_id, variable.variable_id, data)),
    onDeleteVariable: (variable: Variable) => dispatch(deleteVariableForExercise(exercise.exercise_id, variable.variable_id)),
  };

  return (
    <ExerciseOrScenarioContext.Provider value={context}>
      <TopBar />
      <ExerciseHeader />
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
    </ExerciseOrScenarioContext.Provider>
  );
};

const Index = () => {
  // Standard hooks
  const dispatch = useAppDispatch();

  // Fetching data
  const { exerciseId } = useParams() as { exerciseId: Exercise['exercise_id'] };
  const exercise = useHelper((helper: ExercicesHelper) => helper.getExercise(exerciseId));
  useDataLoader(() => {
    dispatch(fetchExercise(exerciseId));
  });

  if (exercise) {
    return (<IndexComponent exercise={exercise} />);
  }

  return (
    <>
      <TopBar />
      <Loader />
    </>
  );
};

export default Index;
