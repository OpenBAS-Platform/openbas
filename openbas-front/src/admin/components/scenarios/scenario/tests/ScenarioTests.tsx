import { FunctionComponent } from 'react';
import { useParams } from 'react-router-dom';
import type { ScenarioStore } from '../../../../../actions/scenarios/Scenario';
import type { InjectTestStatus } from '../../../../../utils/api-types';
import { fetchInjectTestStatus, searchScenarioInjectTests } from '../../../../../actions/inject_test/inject-test-actions';
import InjectTestList from '../../../injects/InjectTestList';

const ScenarioTests: FunctionComponent = () => {
  const { scenarioId, statusId } = useParams() as { scenarioId: ScenarioStore['scenario_id'], statusId: InjectTestStatus['status_id'] };

  return (
    <InjectTestList searchInjectTests={searchScenarioInjectTests} searchInjectTest={fetchInjectTestStatus} exerciseOrScenarioId={scenarioId} statusId={statusId} />
  );
};

export default ScenarioTests;
