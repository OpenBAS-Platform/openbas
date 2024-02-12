import React from 'react';
import { makeStyles } from '@mui/styles';
import { useParams } from 'react-router-dom';
import DefinitionMenu from '../DefinitionMenu';
import { useHelper } from '../../../../store';
import type { Variable, VariableInput } from '../../../../utils/api-types';
import { usePermissions } from '../../../../utils/Exercise';
import useDataLoader from '../../../../utils/ServerSideEvent';
import { useAppDispatch } from '../../../../utils/hooks';
import type { ExercicesHelper } from '../../../../actions/helper';
import Variables from '../../../../components/variables/Variables';
import { VariablesHelper } from '../../../../actions/variables/variable-helper';
import { addVariableForExercise, deleteVariableForExercise, fetchVariablesForExercise, updateVariableForExercise } from '../../../../actions/variables/variable-actions';

const useStyles = makeStyles(() => ({
  container: {
    margin: '10px 0 50px 0',
    padding: '0 200px 0 0',
  },
}));

const ExerciseVariables = () => {
  // Standard hooks
  const classes = useStyles();
  const dispatch = useAppDispatch();
  // Fetching data
  const { exerciseId } = useParams<'exerciseId'>();
  const { variables }: { variables: Variable[] } = useHelper((helper: VariablesHelper & ExercicesHelper) => {
    return {
      variables: helper.getExerciseVariables(exerciseId),
    };
  });
  useDataLoader(() => {
    dispatch(fetchVariablesForExercise(exerciseId));
  });

  const permissions = usePermissions(exerciseId);
  const onCreate = (data: VariableInput) => dispatch(addVariableForExercise(exerciseId, data));
  const onEdit = (variable: Variable, data: VariableInput) => dispatch(updateVariableForExercise(exerciseId, variable.variable_id, data));
  const onDelete = (variable: Variable) => dispatch(deleteVariableForExercise(exerciseId, variable.variable_id));

  return (
    <div className={classes.container}>
      <DefinitionMenu exerciseId={exerciseId} />
      <Variables
        variables={variables}
        permissions={permissions}
        onCreate={onCreate}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
};

export default ExerciseVariables;
