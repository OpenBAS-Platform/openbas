import { Grid, Paper, Typography } from '@mui/material';
import React, { FunctionComponent, useState } from 'react';
import { makeStyles, useTheme } from '@mui/styles';
import { useFormatter } from '../../../../../components/i18n';
import type { ExerciseStore } from '../../../../../actions/exercises/Exercise';
import ExerciseDistributionScoreByInject from './ExerciseDistributionScoreByInject';
import ExerciseDistributionScoreByPlayer from './ExerciseDistributionScoreByPlayer';
import ExerciseDistributionScoreByOrganization from './ExerciseDistributionScoreByOrganization';
import ExerciseDistributionScoreOverTimeByInjectorContract from './ExerciseDistributionScoreOverTimeByInjectorContract';
import ExerciseDistributionByInjectorContract from './ExerciseDistributionByInjectorContract';
import ExerciseDistributionScoreOverTimeByTeam from './ExerciseDistributionScoreOverTimeByTeam';
import ExerciseDistributionScoreByTeam from './ExerciseDistributionScoreByTeam';
import ExerciseDistributionScoreByTeamInPercentage from './ExerciseDistributionScoreByTeamInPercentage';
import ExerciseDistributionScoreOverTimeByTeamInPercentage from './ExerciseDistributionScoreOverTimeByTeamInPercentage';
import useDataLoader from '../../../../../utils/hooks/useDataLoader';
import { fetchExercise, fetchExerciseInjectExpectations, fetchExerciseTeams } from '../../../../../actions/Exercise';
import { useAppDispatch } from '../../../../../utils/hooks';
import { fetchExerciseInjects } from '../../../../../actions/Inject';
import { useHelper } from '../../../../../store';
import type { InjectHelper } from '../../../../../actions/injects/inject-helper';
import arrowDark from '../../../../../static/images/misc/arrow_dark.png';
import arrowLight from '../../../../../static/images/misc/arrow_light.png';
import type { Theme } from '../../../../../components/Theme';
import type { ExercisesHelper } from '../../../../../actions/exercises/exercise-helper';
import Loader from '../../../../../components/Loader';

const useStyles = makeStyles(() => ({
  paperChart: {
    position: 'relative',
    padding: '0 20px 0 0',
    overflow: 'hidden',
    height: '100%',
  },
}));

interface Props {
  exerciseId: ExerciseStore['exercise_id'];
  isReport?: boolean,
}

const ExerciseDistribution: FunctionComponent<Props> = ({
  exerciseId,
  isReport = false,
}) => {
  // Standard hooks
  const theme = useTheme<Theme>();
  const { t } = useFormatter();
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);

  useDataLoader(() => {
    setLoading(true);
    const fetchPromises = [
      dispatch(fetchExercise(exerciseId)).finally(() => setLoading(false)),
      dispatch(fetchExerciseInjectExpectations(exerciseId)),
      dispatch(fetchExerciseInjects(exerciseId)),
      dispatch(fetchExerciseTeams(exerciseId)),
    ];
    Promise.all(fetchPromises)
      .finally(() => {
        setLoading(false);
      });
  });

  const { injectExpectations, exercise } = useHelper((helper: InjectHelper & ExercisesHelper) => ({
    exercise: helper.getExercise(exerciseId),
    injectExpectations: helper.getExerciseInjectExpectations(exerciseId),
  }));

  if (loading) {
    return <Loader />;
  }

  if (exercise.exercise_status === 'SCHEDULED' && injectExpectations?.length === 0 && !isReport) {
    return (
      <div style={{ marginTop: 100, textAlign: 'center' }}>
        <div style={{ fontSize: 20 }}>
          {t('This simulation is not running yet. Start now!')}
        </div>
        <img style={{ marginTop: 20 }} width={100} src={theme.palette.mode === 'dark' ? arrowDark : arrowLight} alt="arrow" />
      </div>
    );
  }
  if (injectExpectations?.length === 0) {
    return <div />;
  }
  return (
    <Grid container={true} spacing={3}>
      <Grid item xs={6} style={{ marginTop: 25 }}>
        <Typography variant="h4">
          {t('Distribution of score by team (in % of expectations)')}
        </Typography>
        <Paper variant="outlined" classes={{ root: classes.paperChart }}>
          <ExerciseDistributionScoreByTeamInPercentage exerciseId={exerciseId} />
        </Paper>
      </Grid>
      <Grid item xs={6} style={{ marginTop: 25 }}>
        <Typography variant="h4">
          {t('Teams scores over time (in % of expectations)')}
        </Typography>
        <Paper variant="outlined" classes={{ root: classes.paperChart }}>
          <ExerciseDistributionScoreOverTimeByTeamInPercentage exerciseId={exerciseId} />
        </Paper>
      </Grid>
      <Grid item xs={6} style={{ marginTop: 25 }}>
        <Typography variant="h4">
          {t('Distribution of total score by team')}
        </Typography>
        <Paper variant="outlined" classes={{ root: classes.paperChart }}>
          <ExerciseDistributionScoreByTeam exerciseId={exerciseId} />
        </Paper>
      </Grid>
      <Grid item xs={6} style={{ marginTop: 25 }}>
        <Typography variant="h4">{t('Teams scores over time')}</Typography>
        <Paper variant="outlined" classes={{ root: classes.paperChart }}>
          <ExerciseDistributionScoreOverTimeByTeam exerciseId={exerciseId} />
        </Paper>
      </Grid>
      <Grid item xs={6} style={{ marginTop: 25 }}>
        <Typography variant="h4">
          {t('Distribution of total score by inject type')}
        </Typography>
        <Paper variant="outlined" classes={{ root: classes.paperChart }}>
          <ExerciseDistributionByInjectorContract exerciseId={exerciseId} />
        </Paper>
      </Grid>
      <Grid item xs={6} style={{ marginTop: 25 }}>
        <Typography variant="h4">
          {t('Inject types scores over time')}
        </Typography>
        <Paper variant="outlined" classes={{ root: classes.paperChart }}>
          <ExerciseDistributionScoreOverTimeByInjectorContract exerciseId={exerciseId} />
        </Paper>
      </Grid>
      <Grid item xs={6} style={{ marginTop: 25 }}>
        <Typography variant="h4">
          {t('Distribution of total score by organization')}
        </Typography>
        <Paper variant="outlined" classes={{ root: classes.paperChart }}>
          <ExerciseDistributionScoreByOrganization exerciseId={exerciseId} />
        </Paper>
      </Grid>
      <Grid item xs={3} style={{ marginTop: 25 }}>
        <Typography variant="h4">
          {t('Distribution of total score by player')}
        </Typography>
        <Paper variant="outlined" classes={{ root: classes.paperChart }}>
          <ExerciseDistributionScoreByPlayer exerciseId={exerciseId} />
        </Paper>
      </Grid>
      <Grid item xs={3} style={{ marginTop: 25 }}>
        <Typography variant="h4">
          {t('Distribution of total score by inject')}
        </Typography>
        <Paper variant="outlined" classes={{ root: classes.paperChart }}>
          <ExerciseDistributionScoreByInject exerciseId={exerciseId} />
        </Paper>
      </Grid>
    </Grid>
  );
};
export default ExerciseDistribution;
