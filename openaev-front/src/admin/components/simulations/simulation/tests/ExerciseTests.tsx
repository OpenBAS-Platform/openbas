import { type FunctionComponent } from 'react';
import { useParams } from 'react-router';

import { bulkTestInjects, deleteInjectTest, fetchInjectTestStatus, searchInjectTests, testInject } from '../../../../../actions/inject_test/simulation-inject-test-actions';
import { type Exercise, type InjectTestStatusOutput } from '../../../../../utils/api-types';
import { simulationKey } from '../../../../../utils/query/keys';
import { isFeatureEnabled } from '../../../../../utils/utils';
import { InjectTestContext, type InjectTestContextType } from '../../../common/Context';
import InjectTestList from '../../../injects/InjectTestList';

const ExerciseTests: FunctionComponent = () => {
  const { exerciseId, statusId } = useParams() as {
    exerciseId: Exercise['exercise_id'];
    statusId: InjectTestStatusOutput['status_id'];
  };

  // With live updates on, the tests list is a query under the simulation key.
  const liveUpdates = isFeatureEnabled('STREAM_INVALIDATION');
  const injectTestContext: InjectTestContextType = {
    contextId: exerciseId,
    bulkTestInjects: bulkTestInjects,
    deleteInjectTest: deleteInjectTest,
    searchInjectTests: searchInjectTests,
    fetchInjectTestStatus: fetchInjectTestStatus,
    testInject: testInject,
  };

  return (
    <InjectTestContext.Provider value={injectTestContext}>
      <InjectTestList statusId={statusId} queryKey={liveUpdates ? [...simulationKey(exerciseId), 'inject-tests'] : undefined} />
    </InjectTestContext.Provider>
  );
};

export default ExerciseTests;
