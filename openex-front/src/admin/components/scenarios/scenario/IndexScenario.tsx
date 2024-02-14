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

const Scenario = lazy(() => import('./Scenario'));
const Teams = lazy(() => import('./Teams'));
const Articles = lazy(() => import('./articles/ScenarioArticles'));
const Challenges = lazy(() => import('../../exercises/challenges/Challenges'));
const Variables = lazy(() => import('./variables/ScenarioVariables'));

const IndexScenarioComponent: FunctionComponent<{ scenarioId: string }> = ({ scenarioId }) => {
  // Standard hooks
  const dispatch = useAppDispatch();

  // Fetching data
  const { scenario } = useHelper((helper: ScenariosHelper) => ({
    scenario: helper.getScenario(scenarioId),
  }));
  useDataLoader(() => {
    dispatch(fetchScenario(scenarioId));
  });

  if (scenario) {
    return (
      <>
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
      </>
    );
  }
  return (
    <>
      <TopBar />
      <NotFound />
    </>
  );
};

const IndexScenario = () => {
  // Standard hooks
  const { scenarioId } = useParams();

  if (scenarioId) {
    return (<IndexScenarioComponent scenarioId={scenarioId} />);
  }

  return (
    <NotFound></NotFound>
  );
};

export default IndexScenario;
