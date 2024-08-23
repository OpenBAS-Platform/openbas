import type { ExerciseStore } from '../../../../actions/exercises/Exercise';
import { useAppDispatch } from '../../../../utils/hooks';
import type { Inject } from '../../../../utils/api-types';
import {
  addInjectForExercise,
  bulkDeleteInjectsForExercise,
  deleteInjectForExercise,
  injectDone,
  updateInjectActivationForExercise,
  updateInjectForExercise,
  updateInjectTriggerForExercise,
} from '../../../../actions/Inject';
import { secondsFromToNow } from '../../../../utils/Exercise';
import type { InjectStore } from '../../../../actions/injects/Inject';

const LessonsContext = (exercise: ExerciseStore) => {
  const dispatch = useAppDispatch();

  return {
    onAddInject(inject: Inject): Promise<{ result: string }> {
      return dispatch(addInjectForExercise(exercise.exercise_id, inject));
    },
    onUpdateInject(injectId: Inject['inject_id'], inject: Inject): Promise<{ result: string }> {
      return dispatch(updateInjectForExercise(exercise.exercise_id, injectId, inject));
    },
    onUpdateInjectTrigger(injectId: Inject['inject_id']): void {
      const injectDependsDuration = secondsFromToNow(
        exercise.exercise_start_date,
      );
      return dispatch(updateInjectTriggerForExercise(exercise.exercise_id, injectId, { inject_depends_duration: injectDependsDuration > 0 ? injectDependsDuration : 0 }));
    },
    onUpdateInjectActivation(injectId: Inject['inject_id'], injectEnabled: { inject_enabled: boolean }): Promise<{
      result: string,
      entities: { injects: Record<string, InjectStore> }
    }> {
      return dispatch(updateInjectActivationForExercise(exercise.exercise_id, injectId, injectEnabled));
    },
    onInjectDone(injectId: Inject['inject_id']): void {
      return dispatch(injectDone(exercise.exercise_id, injectId));
    },
    onDeleteInject(injectId: Inject['inject_id']): void {
      return dispatch(deleteInjectForExercise(exercise.exercise_id, injectId));
    },
    onBulkDeleteInjects(injectIds: string[]): void {
      return dispatch(bulkDeleteInjectsForExercise(exercise.exercise_id, injectIds));
    },
  };
};

export default LessonsContext;
