import { makeStyles } from '@mui/styles';
import DefinitionMenu from '../../components/DefinitionMenu';
import React from 'react';
import { useAppDispatch } from '../../../../utils/hooks';
import { useParams } from 'react-router-dom';
import type { Exercise } from '../../../../utils/api-types';
import { useHelper } from '../../../../store';
import useDataLoader from '../../../../utils/ServerSideEvent';
import Challenges from '../../components/challenges/Challenges';
import { fetchExerciseChallenges } from '../../../../actions/Challenge';
import { ChallengesHelper } from '../../../../actions/helper';

const useStyles = makeStyles(() => ({
  container: {
    margin: '10px 0 50px 0',
    padding: '0 200px 0 0',
  },
}));

const ExerciseChallenges = () => {
  // Standard hooks
  const classes = useStyles();
  const dispatch = useAppDispatch();

  // Fetching data
  const { exerciseId } = useParams() as { exerciseId: Exercise['exercise_id'] };
  const challenges = useHelper((helper: ChallengesHelper) => helper.getExerciseChallenges(exerciseId));
  useDataLoader(() => {
    dispatch(fetchExerciseChallenges(exerciseId));
  });

  return (
    <div className={classes.container}>
      <DefinitionMenu base="/admin/exercises" id={exerciseId} />
      <Challenges challenges={challenges} />
    </div>
  );
};

export default ExerciseChallenges;
