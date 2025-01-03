import { FunctionComponent } from 'react';
import { useParams } from 'react-router';

import { fetchInjectTestStatus, searchScenarioInjectTests } from '../../../../../actions/inject_test/inject-test-actions';
import type { InjectTestStatus, Scenario } from '../../../../../utils/api-types';
import InjectTestList from '../../../injects/InjectTestList';

const ScenarioTests: FunctionComponent = () => {
  const { scenarioId, statusId } = useParams() as { scenarioId: Scenario['scenario_id']; statusId: InjectTestStatus['status_id'] };

  return (
    <InjectTestList searchInjectTests={searchScenarioInjectTests} searchInjectTest={fetchInjectTestStatus} exerciseOrScenarioId={scenarioId} statusId={statusId} />
  );
};

export default ScenarioTests;
