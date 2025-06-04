import { type FunctionComponent } from 'react';
import { useParams } from 'react-router';

import { fetchInjectTestStatus, searchInjectTests } from '../../../../../actions/inject_test/simulation-inject-test-actions';
import { type Exercise, type InjectTestStatusOutput } from '../../../../../utils/api-types';
import { InjectTestContext } from '../../../common/Context';
import InjectTestList from '../../../injects/InjectTestList';

const ExerciseTests: FunctionComponent = () => {
  const { exerciseId, statusId } = useParams() as {
    exerciseId: Exercise['exercise_id'];
    statusId: InjectTestStatusOutput['status_id'];
  };

  return (
    <InjectTestContext.Provider value={{
      contextId: exerciseId,
      searchInjectTests: searchInjectTests,
      fetchInjectTestStatus: fetchInjectTestStatus,
    }}
    >
      <InjectTestList statusId={statusId} />
    </InjectTestContext.Provider>
  );
};

export default ExerciseTests;
