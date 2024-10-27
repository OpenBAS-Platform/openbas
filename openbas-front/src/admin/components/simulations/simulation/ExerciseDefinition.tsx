import { useParams } from 'react-router-dom';
import { Grid, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useHelper } from '../../../../store';
import type { ExercisesHelper } from '../../../../actions/exercises/exercise-helper';
import type { ExerciseStore } from '../../../../actions/exercises/Exercise';
import { useFormatter } from '../../../../components/i18n';
import ExerciseTeams from './teams/ExerciseTeams';
import ExerciseVariables from './variables/ExerciseVariables';
import ExerciseChallenges from './challenges/ExerciseChallenges';
import ExerciseArticles from './articles/ExerciseArticles';

// Deprecated - https://mui.com/system/styles/basics/
// Do not use it for new code.
const useStyles = makeStyles(() => ({
  gridContainer: {
    marginBottom: 20,
  },
}));

const ExerciseDefinition = () => {
  // Standard hooks
  const classes = useStyles();
  const { t } = useFormatter();
  const { exerciseId } = useParams() as { exerciseId: ExerciseStore['exercise_id'] };
  // Fetching data
  const { exercise } = useHelper((helper: ExercisesHelper) => ({
    exercise: helper.getExercise(exerciseId),
  }));
  return (
    <>
      <Grid
        container
        spacing={3}
        classes={{ container: classes.gridContainer }}
      >
        <Grid item xs={6} style={{ paddingTop: 10 }}>
          <ExerciseTeams exerciseTeamsUsers={exercise.exercise_teams_users ?? []} />
        </Grid>
        <Grid item xs={6} style={{ paddingTop: 10 }}>
          <ExerciseVariables />
        </Grid>
        <Grid item xs={12} style={{ marginTop: 25 }}>
          <Typography variant="h4" gutterBottom style={{ float: 'left' }}>
            {t('Media pressure')}
          </Typography>
          <ExerciseArticles />
        </Grid>
        <Grid item xs={12} style={{ marginTop: 10 }}>
          <Typography variant="h4" gutterBottom style={{ float: 'left' }}>
            {t('Used challenges (in injects)')}
          </Typography>
          <ExerciseChallenges />
        </Grid>
      </Grid>
    </>
  );
};

export default ExerciseDefinition;
