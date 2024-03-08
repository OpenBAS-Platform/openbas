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
import useScenarioPermissions from '../../../../utils/Scenario';
import { DocumentContext, DocumentContextType, PermissionsContext, PermissionsContextType } from '../../components/Context';

const Scenario = lazy(() => import('./Scenario'));
const Teams = lazy(() => import('./teams/ScenarioTeams'));
const Articles = lazy(() => import('./articles/ScenarioArticles'));
const Challenges = lazy(() => import('./challenges/ScenarioChallenges'));
const Variables = lazy(() => import('./variables/ScenarioVariables'));
const Injects = lazy(() => import('./injects/ScenarioInjects'));

const IndexScenarioComponent: FunctionComponent<{ scenario: ScenarioStore }> = ({
  scenario,
}) => {
  const permissionsContext: PermissionsContextType = {
    permissions: useScenarioPermissions(scenario.scenario_id),
  };
  const documentContext: DocumentContextType = {
    onInitDocument: () => ({
      document_tags: [],
      document_scenarios: scenario ? [{ id: scenario.scenario_id, label: scenario.scenario_name }] : [],
      document_exercises: [],
    }),
  };

  return (
    <PermissionsContext.Provider value={permissionsContext}>
      <DocumentContext.Provider value={documentContext}>
        <TopBar />
        <ScenarioHeader />
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="" element={errorWrapper(Scenario)()} />
            <Route path="definition/teams" element={errorWrapper(Teams)({ scenarioTeamsUsers: scenario.scenario_teams_users })} />
            <Route path="definition/articles" element={errorWrapper(Articles)()} />
            <Route path="definition/challenges" element={errorWrapper(Challenges)()} />
            <Route path="definition/variables" element={errorWrapper(Variables)()} />
            <Route path="injects" element={errorWrapper(Injects)()} />
            {/* Not found */}
            <Route path="*" element={<NotFound/>}/>
          </Routes>
        </Suspense>
      </DocumentContext.Provider>
    </PermissionsContext.Provider>
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
