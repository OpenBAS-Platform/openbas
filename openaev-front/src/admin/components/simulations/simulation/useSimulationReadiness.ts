import { useCallback } from 'react';

import { fetchExerciseExpectationsDrift, searchExerciseHealthchecks } from '../../../../actions/Exercise';
import type { ExercisesHelper } from '../../../../actions/exercises/exercise-helper';
import { fetchExerciseInjectsSimple, reconcileExerciseInjects } from '../../../../actions/Inject';
import type { InjectHelper } from '../../../../actions/injects/inject-helper';
import { useHelper } from '../../../../store';
import type { Exercise } from '../../../../utils/api-types';
import { useAppDispatch } from '../../../../utils/hooks';
import { useReadiness } from '../../common/healthchecks/readiness';

const useSimulationReadiness = (exerciseId: Exercise['exercise_id']) => {
  const dispatch = useAppDispatch();
  const { exercise, injects } = useHelper((helper: ExercisesHelper & InjectHelper) => ({
    exercise: helper.getExercise(exerciseId),
    injects: helper.getExerciseInjects(exerciseId),
  }));
  // Reconcile (not just fetch): injects can be deleted server-side out of band - deleting a
  // phishing landing page cascade-deletes the injects built on its contract - and the
  // merge-only store would otherwise keep counting the ghosts in the hero until a full reload.
  const loadInjects = useCallback(
    () => dispatch(reconcileExerciseInjects(exerciseId, fetchExerciseInjectsSimple)),
    [dispatch, exerciseId],
  );
  return useReadiness({
    id: exerciseId,
    updatedAt: exercise?.exercise_updated_at,
    injects,
    workflowId: exercise?.exercise_workflow_id,
    loadInjects,
    fetchHealthchecks: searchExerciseHealthchecks,
    fetchExpectationsDrift: fetchExerciseExpectationsDrift,
  });
};

export default useSimulationReadiness;
