import React from 'react';
import { makeStyles } from '@mui/styles';
import { useParams } from 'react-router-dom';
import { useHelper } from '../../../../store';
import type { Exercise } from '../../../../utils/api-types';
import useDataLoader from '../../../../utils/ServerSideEvent';
import { useAppDispatch } from '../../../../utils/hooks';
import Variables from '../../components/variables/Variables';
import type { VariablesHelper } from '../../../../actions/variables/variable-helper';
import { fetchVariablesForExercise } from '../../../../actions/variables/variable-actions';
import DefinitionMenu from '../../components/DefinitionMenu';

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
  const { exerciseId } = useParams() as { exerciseId: Exercise['exercise_id'] };
  const variables = useHelper((helper: VariablesHelper) => helper.getExerciseVariables(exerciseId));
  useDataLoader(() => {
    dispatch(fetchVariablesForExercise(exerciseId));
  });

  return (
    <div className={classes.container}>
      <DefinitionMenu base="/admin/exercises" id={exerciseId} />
      <Variables variables={variables} />
    </div>
  );
};

export default ExerciseVariables;
