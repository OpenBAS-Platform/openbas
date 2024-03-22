import React from 'react';
import { Grid } from '@mui/material';
import { useParams } from 'react-router-dom';
import type { ExerciseStore } from '../../../../../actions/exercises/Exercise';
import ExerciseDistribution from './ExerciseDistribution';

const Exercise = () => {
  // Fetching data
  const { exerciseId } = useParams() as { exerciseId: ExerciseStore['exercise_id'] };

  return (
    <>
      <Grid container spacing={3}>
        <ExerciseDistribution exerciseId={exerciseId} />
      </Grid>
    </>
  );
};

export default Exercise;
