import React, { FunctionComponent, lazy, Suspense } from 'react';
import { Route, Routes, useParams } from 'react-router-dom';
import Loader from '../../../../components/Loader';
import { errorWrapper } from '../../../../components/Error';
import { useAppDispatch } from '../../../../utils/hooks';
import { useHelper } from '../../../../store';
import type { ScenariosHelper } from '../../../../actions/scenarios/scenario-helper';
import useDataLoader from '../../../../utils/ServerSideEvent';
import { fetchScenario } from '../../../../actions/scenarios/scenario-actions';
import NotFound from '../../../../components/NotFound';
import TopBar from '../../nav/TopBar';
import ScenarioHeader from './ScenarioHeader';
import type { ScenarioStore } from '../../../../actions/scenarios/Scenario';
import ExerciseOrScenarioContext, { ExerciseOrScenario } from '../../../ExerciseOrScenarioContext';
import useScenarioPermissions from '../../../../utils/Scenario';
import type { ArticleCreateInput, ArticleUpdateInput, Variable, VariableInput } from '../../../../utils/api-types';
import { addVariableForScenario, deleteVariableForScenario, updateVariableForScenario } from '../../../../actions/variables/variable-actions';
import type { ArticleStore, FullArticleStore } from '../../../../actions/channels/Article';
import { addScenarioArticle, deleteScenarioArticle, updateScenarioArticle } from '../../../../actions/channels/article-action';

const Scenario = lazy(() => import('./Scenario'));
const Teams = lazy(() => import('./teams/ScenarioTeams'));
const Articles = lazy(() => import('./articles/ScenarioArticles'));
const Challenges = lazy(() => import('./challenges/ScenarioChallenges'));
const Variables = lazy(() => import('./variables/ScenarioVariables'));

const IndexScenarioComponent: FunctionComponent<{ scenario: ScenarioStore }> = ({
  scenario,
}) => {
  // Standard hooks
  const dispatch = useAppDispatch();

  const context: ExerciseOrScenario = {
    permissions: useScenarioPermissions(scenario.scenario_id),

    previewArticleUrl: (article: FullArticleStore) => `/channels/${scenario.scenario_id}/${article.article_fullchannel.channel_id}?preview=true`,
    onAddArticle: (data: ArticleCreateInput) => dispatch(addScenarioArticle(scenario.scenario_id, data)),
    onUpdateArticle: (article: ArticleStore, data: ArticleUpdateInput) => dispatch(
      updateScenarioArticle(scenario.scenario_id, article.article_id, data),
    ),
    onDeleteArticle: (article: ArticleStore) => dispatch(
      deleteScenarioArticle(scenario.scenario_id, article.article_id),
    ),

    previewChallengeUrl: () => `/challenges/${scenario.scenario_id}?preview=true`,

    onInitDocument: () => ({
      document_tags: [],
      document_scenarios: scenario ? [{ id: scenario.scenario_id, label: scenario.scenario_name }] : [],
      document_exercises: [],
    }),

    onCreateVariable: (data: VariableInput) => dispatch(addVariableForScenario(scenario.scenario_id, data)),
    onEditVariable: (variable: Variable, data: VariableInput) => dispatch(updateVariableForScenario(scenario.scenario_id, variable.variable_id, data)),
    onDeleteVariable: (variable: Variable) => dispatch(deleteVariableForScenario(scenario.scenario_id, variable.variable_id)),
  };

  return (
    <ExerciseOrScenarioContext.Provider value={context}>
      <TopBar />
      <ScenarioHeader />
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="" element={errorWrapper(Scenario)()} />
          <Route path="definition/teams" element={errorWrapper(Teams)()} />
          <Route path="definition/articles" element={errorWrapper(Articles)()} />
          <Route path="definition/challenges" element={errorWrapper(Challenges)()} />
          <Route path="definition/variables" element={errorWrapper(Variables)()} />
        </Routes>
      </Suspense>
    </ExerciseOrScenarioContext.Provider>
  );
};

const IndexScenario = () => {
  // Standard hooks
  const dispatch = useAppDispatch();

  // Fetching data
  const { scenarioId } = useParams() as { scenarioId: ScenarioStore['scenario_id'] };
  const scenario = useHelper((helper: ScenariosHelper) => helper.getScenario(scenarioId));
  useDataLoader(() => {
    dispatch(fetchScenario(scenarioId));
  });

  if (scenario) {
    return (<IndexScenarioComponent scenario={scenario} />);
  }

  return (
    <>
      <TopBar />
      <NotFound />
    </>
  );
};

export default IndexScenario;
