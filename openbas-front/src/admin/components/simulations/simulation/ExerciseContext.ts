import type { ExerciseStore } from '../../../../actions/exercises/Exercise';
import { useAppDispatch } from '../../../../utils/hooks';
import type { ImportTestSummary, Inject, InjectsImportInput, InjectTestStatus, SearchPaginationInput } from '../../../../utils/api-types';
import {
  addInjectForExercise,
  bulkDeleteInjectsForExercise,
  deleteInjectForExercise,
  fetchExerciseInjects,
  injectDone,
  updateInjectActivationForExercise,
  updateInjectForExercise,
  updateInjectTriggerForExercise,
} from '../../../../actions/Inject';
import type { InjectOutputType, InjectStore } from '../../../../actions/injects/Inject';
import { dryImportXlsForExercise, importXlsForExercise } from '../../../../actions/exercises/exercise-action';
import { fetchExercise, fetchExerciseTeams } from '../../../../actions/Exercise';
import { Page } from '../../../../components/common/queryable/Page';
import { bulkTestInjects, searchExerciseInjectsSimple } from '../../../../actions/injects/inject-action';

const injectContextForExercise = (exercise: ExerciseStore) => {
  const dispatch = useAppDispatch();

  return {
    searchInjects(input: SearchPaginationInput): Promise<{ data: Page<InjectOutputType> }> {
      return searchExerciseInjectsSimple(exercise.exercise_id, input);
    },
    onAddInject(inject: Inject): Promise<{ result: string, entities: { injects: Record<string, InjectStore> } }> {
      return dispatch(addInjectForExercise(exercise.exercise_id, inject));
    },
    onUpdateInject(injectId: Inject['inject_id'], inject: Inject): Promise<{ result: string, entities: { injects: Record<string, InjectStore> } }> {
      return dispatch(updateInjectForExercise(exercise.exercise_id, injectId, inject));
    },
    onUpdateInjectTrigger(injectId: Inject['inject_id']): Promise<{ result: string, entities: { injects: Record<string, InjectStore> } }> {
      return dispatch(updateInjectTriggerForExercise(exercise.exercise_id, injectId));
    },
    onUpdateInjectActivation(injectId: Inject['inject_id'], injectEnabled: { inject_enabled: boolean }): Promise<{
      result: string,
      entities: { injects: Record<string, InjectStore> }
    }> {
      return dispatch(updateInjectActivationForExercise(exercise.exercise_id, injectId, injectEnabled));
    },
    onInjectDone(injectId: Inject['inject_id']): Promise<{ result: string, entities: { injects: Record<string, InjectStore> } }> {
      return dispatch(injectDone(exercise.exercise_id, injectId));
    },
    onDeleteInject(injectId: Inject['inject_id']): Promise<void> {
      return dispatch(deleteInjectForExercise(exercise.exercise_id, injectId));
    },
    onImportInjectFromXls(importId: string, input: InjectsImportInput): Promise<ImportTestSummary> {
      return importXlsForExercise(exercise.exercise_id, importId, input).then((response) => new Promise((resolve, _reject) => {
        dispatch(fetchExerciseInjects(exercise.exercise_id));
        dispatch(fetchExercise(exercise.exercise_id));
        dispatch(fetchExerciseTeams(exercise.exercise_id));
        resolve(response.data);
      }));
    },
    async onDryImportInjectFromXls(importId: string, input: InjectsImportInput): Promise<ImportTestSummary> {
      return dryImportXlsForExercise(exercise.exercise_id, importId, input).then((result) => result.data);
    },
    onBulkDeleteInjects(injectIds: string[]): void {
      return dispatch(bulkDeleteInjectsForExercise(exercise.exercise_id, injectIds));
    },
    bulkTestInjects(injectIds: string[]): Promise<{ uri: string, data: InjectTestStatus[] }> {
      return bulkTestInjects(injectIds).then((result) => ({
        uri: `/admin/exercises/${exercise.exercise_id}/tests`,
        data: result.data,
      }));
    },
  };
};

export default injectContextForExercise;
