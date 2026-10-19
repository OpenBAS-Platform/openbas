import { type FunctionComponent } from 'react';
import { useParams } from 'react-router';

import { bulkTestInjects, deleteInjectTest, fetchInjectTestStatus, searchInjectTests, testInject } from '../../../../../actions/inject_test/scenario-inject-test-actions';
import { type InjectTestStatusOutput, type Scenario } from '../../../../../utils/api-types';
import { scenarioKey } from '../../../../../utils/query/keys';
import { isFeatureEnabled } from '../../../../../utils/utils';
import { InjectTestContext, type InjectTestContextType } from '../../../common/Context';
import InjectTestList from '../../../injects/InjectTestList';

const ScenarioTests: FunctionComponent = () => {
  const { scenarioId, statusId } = useParams() as {
    scenarioId: Scenario['scenario_id'];
    statusId: InjectTestStatusOutput['status_id'];
  };
  // With live updates on, the tests list is a query under the scenario key.
  const liveUpdates = isFeatureEnabled('STREAM_INVALIDATION');
  const injectTestContext: InjectTestContextType = {
    contextId: scenarioId,
    bulkTestInjects: bulkTestInjects,
    deleteInjectTest: deleteInjectTest,
    searchInjectTests: searchInjectTests,
    fetchInjectTestStatus: fetchInjectTestStatus,
    testInject: testInject,
  };

  return (
    <InjectTestContext.Provider value={injectTestContext}>
      <InjectTestList statusId={statusId} queryKey={liveUpdates ? [...scenarioKey(scenarioId), 'inject-tests'] : undefined} />
    </InjectTestContext.Provider>
  );
};

export default ScenarioTests;
