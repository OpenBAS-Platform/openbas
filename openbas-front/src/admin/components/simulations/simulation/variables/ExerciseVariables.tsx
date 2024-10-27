import { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Paper, Typography } from '@mui/material';
import { useHelper } from '../../../../../store';
import type { Exercise, Variable, VariableInput } from '../../../../../utils/api-types';
import useDataLoader from '../../../../../utils/hooks/useDataLoader';
import { useAppDispatch } from '../../../../../utils/hooks';
import Variables from '../../../components/variables/Variables';
import type { VariablesHelper } from '../../../../../actions/variables/variable-helper';
import { addVariableForExercise, deleteVariableForExercise, fetchVariablesForExercise, updateVariableForExercise } from '../../../../../actions/variables/variable-actions';
import { PermissionsContext, VariableContext, VariableContextType } from '../../../common/Context';
import CreateVariable from '../../../components/variables/CreateVariable';
import { useFormatter } from '../../../../../components/i18n';

const ExerciseVariables = () => {
  // Standard hooks
  const { t } = useFormatter();
  const dispatch = useAppDispatch();
  // Fetching data
  const { exerciseId } = useParams() as { exerciseId: Exercise['exercise_id'] };
  const { permissions } = useContext(PermissionsContext);
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
      <Typography variant="h4" gutterBottom={true} style={{ float: 'left' }}>
        {t('Variables')}
      </Typography>
      {permissions.canWrite && (<CreateVariable />)}
      <div className="clearfix" />
      <Paper sx={{ minHeight: '100%', padding: 2 }} variant="outlined">
        <Variables variables={variables} />
      </Paper>
    </VariableContext.Provider>
  );
};

export default ExerciseVariables;
