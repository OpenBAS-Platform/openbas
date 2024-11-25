import { FunctionComponent } from 'react';
import { useParams } from 'react-router';

import { fetchInjectTestStatus, searchExerciseInjectTests } from '../../../../../actions/inject_test/inject-test-actions';
import type { Exercise, InjectTestStatus } from '../../../../../utils/api-types';
import InjectTestList from '../../../injects/InjectTestList';

const ExerciseTests: FunctionComponent = () => {
  const { exerciseId, statusId } = useParams() as { exerciseId: Exercise['exercise_id']; statusId: InjectTestStatus['status_id'] };

  return (
    <InjectTestList searchInjectTests={searchExerciseInjectTests} searchInjectTest={fetchInjectTestStatus} exerciseOrScenarioId={exerciseId} statusId={statusId} />
  );
};

export default ExerciseTests;
