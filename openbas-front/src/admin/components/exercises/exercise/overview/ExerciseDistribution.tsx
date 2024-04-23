import { Grid, Paper, Typography } from '@mui/material';
import React, { FunctionComponent } from 'react';
import { makeStyles } from '@mui/styles';
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
}

const ExerciseDistribution: FunctionComponent<Props> = ({
  exerciseId,
}) => {
  // Standard hooks
  const { t } = useFormatter();
  const classes = useStyles();

  return (
    <Grid container spacing={3}>
      <Typography variant="h1" style={{ paddingLeft: 24, paddingTop: 24 }}>{t('Distribution')}</Typography>
      <Grid container item spacing={3}>
        <Grid item xs={6} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h4">
            {t('Distribution of score by team (in % of expectations)')}
          </Typography>
          <Paper variant="outlined" classes={{ root: classes.paperChart }}>
            <ExerciseDistributionScoreByTeamInPercentage exerciseId={exerciseId} />
          </Paper>
        </Grid>
        <Grid item xs={6} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h4">
            {t('Teams scores over time (in % of expectations)')}
          </Typography>
          <Paper variant="outlined" classes={{ root: classes.paperChart }}>
            <ExerciseDistributionScoreOverTimeByTeamInPercentage exerciseId={exerciseId} />
          </Paper>
        </Grid>
        <Grid item xs={6} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h4">
            {t('Distribution of total score by team')}
          </Typography>
          <Paper variant="outlined" classes={{ root: classes.paperChart }}>
            <ExerciseDistributionScoreByTeam exerciseId={exerciseId} />
          </Paper>
        </Grid>
        <Grid item xs={6} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h4">{t('Teams scores over time')}</Typography>
          <Paper variant="outlined" classes={{ root: classes.paperChart }}>
            <ExerciseDistributionScoreOverTimeByTeam exerciseId={exerciseId} />
          </Paper>
        </Grid>
        <Grid item xs={6} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h4">
            {t('Distribution of total score by inject type')}
          </Typography>
          <Paper variant="outlined" classes={{ root: classes.paperChart }}>
            <ExerciseDistributionByInjectorContract exerciseId={exerciseId} />
          </Paper>
        </Grid>
        <Grid item xs={6} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h4">
            {t('Inject types scores over time')}
          </Typography>
          <Paper variant="outlined" classes={{ root: classes.paperChart }}>
            <ExerciseDistributionScoreOverTimeByInjectorContract exerciseId={exerciseId} />
          </Paper>
        </Grid>
        <Grid item xs={6} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h4">
            {t('Distribution of total score by organization')}
          </Typography>
          <Paper variant="outlined" classes={{ root: classes.paperChart }}>
            <ExerciseDistributionScoreByOrganization exerciseId={exerciseId} />
          </Paper>
        </Grid>
        <Grid item xs={3} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h4">
            {t('Distribution of total score by player')}
          </Typography>
          <Paper variant="outlined" classes={{ root: classes.paperChart }}>
            <ExerciseDistributionScoreByPlayer exerciseId={exerciseId} />
          </Paper>
        </Grid>
        <Grid item xs={3} sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h4">
            {t('Distribution of total score by inject')}
          </Typography>
          <Paper variant="outlined" classes={{ root: classes.paperChart }}>
            <ExerciseDistributionScoreByInject exerciseId={exerciseId} />
          </Paper>
        </Grid>
      </Grid>
    </Grid>
  );
};
export default ExerciseDistribution;
