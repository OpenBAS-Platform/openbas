import { type FunctionComponent } from 'react';
import { useParams } from 'react-router';

import { bulkTestInjects, deleteInjectTest, fetchInjectTestStatus, searchInjectTests, testInject } from '../../../../../actions/inject_test/scenario-inject-test-actions';
import { type InjectTestExecutionOutput, type Scenario } from '../../../../../utils/api-types';
import { InjectTestContext, type InjectTestContextType } from '../../../common/Context';
import InjectTestList from '../../../injects/InjectTestList';

const ScenarioTests: FunctionComponent = () => {
  const { scenarioId, statusId } = useParams() as {
    scenarioId: Scenario['scenario_id'];
    statusId: InjectTestExecutionOutput['execution_id'];
  };
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
      <InjectTestList statusId={statusId} />
    </InjectTestContext.Provider>
  );
};

export default ScenarioTests;
