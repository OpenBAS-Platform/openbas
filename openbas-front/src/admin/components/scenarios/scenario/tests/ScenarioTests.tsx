import { type FunctionComponent } from 'react';
import { useParams } from 'react-router';

import { fetchInjectTestStatus, searchInjectTests } from '../../../../../actions/inject_test/scenario-inject-test-actions';
import { type InjectTestStatusOutput, type Scenario } from '../../../../../utils/api-types';
import { InjectTestContext } from '../../../common/Context';
import InjectTestList from '../../../injects/InjectTestList';

const ScenarioTests: FunctionComponent = () => {
  const { scenarioId, statusId } = useParams() as {
    scenarioId: Scenario['scenario_id'];
    statusId: InjectTestStatusOutput['status_id'];
  };

  return (
    <InjectTestContext.Provider value={{
      contextId: scenarioId,
      fetchInjectTestStatus: fetchInjectTestStatus,
      searchInjectTests: searchInjectTests,
    }}
    >
      <InjectTestList statusId={statusId} />
    </InjectTestContext.Provider>
  );
};

export default ScenarioTests;
