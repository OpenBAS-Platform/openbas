import React, { FunctionComponent } from 'react';
import { useParams } from 'react-router-dom';
import type { Exercise, Inject } from '../../../../utils/api-types';
import { InjectContext, InjectContextType } from '../../components/Context';
import { useAppDispatch } from '../../../../utils/hooks';
import {
  addInjectForExercise,
  deleteInjectForExercise,
  fetchExerciseInjects,
  fetchInjectTypes,
  injectDone,
  updateInjectActivationForExercise,
  updateInjectForExercise,
} from '../../../../actions/Inject';
import { useHelper } from '../../../../store';
import useDataLoader from '../../../../utils/ServerSideEvent';
import Injects from './Injects';
import { secondsFromToNow } from '../../../../utils/Exercise';
import { fetchExerciseTeams } from '../../../../actions/Exercise';
import type { ExercisesHelper } from '../../../../actions/exercises/exercise-helper';
import type { ArticlesHelper } from '../../../../actions/channels/article-helper';
import type { ChallengesHelper } from '../../../../actions/helper';
import type { VariablesHelper } from '../../../../actions/variables/variable-helper';
import { fetchVariablesForExercise } from '../../../../actions/variables/variable-actions';
import type { InjectHelper } from '../../../../actions/injects/inject-helper';

interface Props {

}

const ExerciseInjects: FunctionComponent<Props> = () => {
  // Standard hooks
  const dispatch = useAppDispatch();
  const { exerciseId } = useParams() as { exerciseId: Exercise['exercise_id'] };

  const { injects, exercise, teams, articles, variables } = useHelper(
    (helper: InjectHelper & ExercisesHelper & ArticlesHelper & ChallengesHelper & VariablesHelper) => {
      return {
        injects: helper.getExerciseInjects(exerciseId),
        exercise: helper.getExercise(exerciseId),
        teams: helper.getExerciseTeams(exerciseId),
        articles: helper.getExerciseArticles(exerciseId),
        variables: helper.getExerciseVariables(exerciseId),
      };
    },
  );
  useDataLoader(() => {
    dispatch(fetchExerciseInjects(exerciseId));
    dispatch(fetchExerciseTeams(exerciseId));
    dispatch(fetchInjectTypes());
    dispatch(fetchVariablesForExercise(exerciseId));
  });

  const context: InjectContextType = {
    onAddInject(inject: Inject): Promise<{ result: string }> {
      return dispatch(addInjectForExercise(exerciseId, inject));
    },
    onUpdateInject(injectId: Inject['inject_id'], inject: Inject): Promise<{ result: string }> {
      return dispatch(updateInjectForExercise(exerciseId, injectId, inject));
    },
    onUpdateInjectTrigger(injectId: Inject['inject_id']): void {
      const injectDependsDuration = secondsFromToNow(
        exercise.exercise_start_date,
      );
      return dispatch(updateInjectForExercise(exerciseId, injectId, injectDependsDuration > 0 ? injectDependsDuration : 0));
    },
    onUpdateInjectActivation(injectId: Inject['inject_id'], injectEnabled: { inject_enabled: boolean }): void {
      return dispatch(updateInjectActivationForExercise(exerciseId, injectId, injectEnabled));
    },
    onInjectDone(injectId: Inject['inject_id']): void {
      return dispatch(injectDone(exerciseId, injectId));
    },
    onDeleteInject(injectId: Inject['inject_id']): void {
      return dispatch(deleteInjectForExercise(exerciseId, injectId));
    },
  };

  return (
    <InjectContext.Provider value={context}>
      <Injects injects={injects} teams={teams} articles={articles} variables={variables}
               uriVariable={`/admin/exercises/${exerciseId}/definition/variables`}
               allUsersNumber={exercise.exercise_all_users_number} usersNumber={exercise.exercise_users_number}
               teamsUsers={exercise.exercise_teams_users}/>
    </InjectContext.Provider>
  );
};

export default ExerciseInjects;
