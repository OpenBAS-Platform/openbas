import React from 'react';
import { useParams } from 'react-router-dom';
import { useHelper } from '../../../../store';
import type { Exercise, Variable, VariableInput } from '../../../../utils/api-types';
import useDataLoader from '../../../../utils/ServerSideEvent';
import { useAppDispatch } from '../../../../utils/hooks';
import Variables from '../../components/variables/Variables';
import type { VariablesHelper } from '../../../../actions/variables/variable-helper';
import { addVariableForExercise, deleteVariableForExercise, fetchVariablesForExercise, updateVariableForExercise } from '../../../../actions/variables/variable-actions';
import DefinitionMenu from '../../common/simulate/DefinitionMenu';
import { VariableContext, VariableContextType } from '../../common/Context';

const ExerciseVariables = () => {
  // Standard hooks
  const dispatch = useAppDispatch();
  // Fetching data
  const { exerciseId } = useParams() as { exerciseId: Exercise['exercise_id'] };
  const variables = useHelper((helper: VariablesHelper) => helper.getExerciseVariables(exerciseId));
  useDataLoader(() => {
    dispatch(fetchVariablesForExercise(exerciseId));
  });

  const context: VariableContextType = {
    onCreateVariable: (data: VariableInput) => dispatch(addVariableForExercise(exerciseId, data)),
    onEditVariable: (variable: Variable, data: VariableInput) => dispatch(updateVariableForExercise(exerciseId, variable.variable_id, data)),
    onDeleteVariable: (variable: Variable) => dispatch(deleteVariableForExercise(exerciseId, variable.variable_id)),
  };

  return (
    <VariableContext.Provider value={context}>
      <DefinitionMenu base="/admin/exercises" id={exerciseId} />
      <Variables variables={variables} />
    </VariableContext.Provider>
  );
};

export default ExerciseVariables;
