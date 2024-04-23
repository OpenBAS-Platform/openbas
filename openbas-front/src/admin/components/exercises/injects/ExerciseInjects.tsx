import React, { FunctionComponent, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ReorderOutlined, SignalCellularAltOutlined } from '@mui/icons-material';
import { Grid, Paper, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import type { Exercise, Inject } from '../../../../utils/api-types';
import { ArticleContext, InjectContext, InjectContextType, TeamContext } from '../../components/Context';
import { useAppDispatch } from '../../../../utils/hooks';
import {
  addInjectForExercise,
  deleteInjectForExercise,
  fetchExerciseInjects,
  injectDone,
  updateInjectActivationForExercise,
  updateInjectForExercise,
} from '../../../../actions/Inject';
import { useHelper } from '../../../../store';
import useDataLoader from '../../../../utils/ServerSideEvent';
import Injects from '../../components/injects/Injects';
import { secondsFromToNow } from '../../../../utils/Exercise';
import { fetchExerciseTeams } from '../../../../actions/Exercise';
import type { ExercisesHelper } from '../../../../actions/exercises/exercise-helper';
import type { ArticlesHelper } from '../../../../actions/channels/article-helper';
import type { ChallengesHelper } from '../../../../actions/helper';
import type { VariablesHelper } from '../../../../actions/variables/variable-helper';
import { fetchVariablesForExercise } from '../../../../actions/variables/variable-actions';
import type { InjectHelper } from '../../../../actions/injects/inject-helper';
import { fetchExerciseArticles } from '../../../../actions/channels/article-action';
import { articleContextForExercise } from '../articles/ExerciseArticles';
import { teamContextForExercise } from '../teams/ExerciseTeams';
import { fetchInjectorContracts } from '../../../../actions/InjectorContracts';
import InjectDistributionByType from '../../components/injects/InjectDistributionByType';
import InjectDistributionByTeam from '../../components/injects/InjectDistributionByTeam';
import ExerciseDistributionScoreByTeamInPercentage from '../exercise/overview/ExerciseDistributionScoreByTeamInPercentage';
import ExerciseDistributionScoreOverTimeByInjectorContract from '../exercise/overview/ExerciseDistributionScoreOverTimeByInjectorContract';
import ExerciseDistributionScoreOverTimeByTeam from '../exercise/overview/ExerciseDistributionScoreOverTimeByTeam';
import ExerciseDistributionScoreOverTimeByTeamInPercentage from '../exercise/overview/ExerciseDistributionScoreOverTimeByTeamInPercentage';
import { useFormatter } from '../../../../components/i18n';

const useStyles = makeStyles(() => ({
  paperChart: {
    position: 'relative',
    padding: '0 20px 0 0',
    overflow: 'hidden',
    height: '100%',
  },
}));

interface Props {

}

const ExerciseInjects: FunctionComponent<Props> = () => {
  // Standard hooks
  const { t } = useFormatter();
  const classes = useStyles();
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
    dispatch(fetchExerciseArticles(exerciseId));
    dispatch(fetchInjectorContracts());
    dispatch(fetchVariablesForExercise(exerciseId));
  });

  const articleContext = articleContextForExercise(exerciseId);
  const teamContext = teamContextForExercise(exerciseId, []);

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

  const [viewMode, setViewMode] = useState('list');

  return (
    <>
      <ToggleButtonGroup
        size="small"
        exclusive
        style={{ float: 'right' }}
        aria-label="Change view mode"
      >
        <Tooltip title={t('List view')}>
          <ToggleButton
            value='list'
            onClick={() => setViewMode('list')}
            selected={viewMode === 'list'}
            aria-label="List view mode"
          >
            <ReorderOutlined
              fontSize="small"
              color={viewMode === 'list' ? 'primary' : 'inherit'}
            />
          </ToggleButton>
        </Tooltip>
        <Tooltip title={t('Distribution view')}>
          <ToggleButton
            value='distribution'
            onClick={() => setViewMode('distribution')}
            selected={viewMode === 'distribution'}
            aria-label="Distribution view mode"
          >
            <SignalCellularAltOutlined
              fontSize="small"
              color={viewMode === 'distribution' ? 'primary' : 'inherit'}
            />
          </ToggleButton>
        </Tooltip>
      </ToggleButtonGroup>
      {viewMode === 'list'
        && <InjectContext.Provider value={context}>
          <ArticleContext.Provider value={articleContext}>
            <TeamContext.Provider value={teamContext}>
              <Injects injects={injects} teams={teams} articles={articles} variables={variables}
                uriVariable={`/admin/exercises/${exerciseId}/definition/variables`}
                allUsersNumber={exercise.exercise_all_users_number}
                usersNumber={exercise.exercise_users_number}
                teamsUsers={exercise.exercise_teams_users}
              />
            </TeamContext.Provider>
          </ArticleContext.Provider>
        </InjectContext.Provider>
      }
      {viewMode === 'distribution'
        && <Grid container spacing={3}>
          <Grid container item spacing={3}>
            <Grid item xs={6} sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h4">
                {t('Distribution of injects by type')}
              </Typography>
              <Paper variant="outlined" classes={{ root: classes.paperChart }}>
                <InjectDistributionByType exerciseId={exerciseId} />
              </Paper>
            </Grid>
            <Grid item xs={6} sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h4">
                {t('Distribution of injects by team')}
              </Typography>
              <Paper variant="outlined" classes={{ root: classes.paperChart }}>
                <InjectDistributionByTeam exerciseId={exerciseId} />
              </Paper>
            </Grid>
            <Grid item xs={3} sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h4">
                {t('Distribution of expectations by inject type')}
              </Typography>
              <Paper variant="outlined" classes={{ root: classes.paperChart }}>
                <ExerciseDistributionScoreByTeamInPercentage exerciseId={exerciseId} />
              </Paper>
            </Grid>
            <Grid item xs={3} sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h4">
                {t('Distribution of expected total score by inject type')}
              </Typography>
              <Paper variant="outlined" classes={{ root: classes.paperChart }}>
                <ExerciseDistributionScoreOverTimeByInjectorContract exerciseId={exerciseId} />
              </Paper>
            </Grid>
            <Grid item xs={3} sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h4">
                {t('Distribution of expectations by team')}
              </Typography>
              <Paper variant="outlined" classes={{ root: classes.paperChart }}>
                <ExerciseDistributionScoreOverTimeByTeam exerciseId={exerciseId} />
              </Paper>
            </Grid>
            <Grid item xs={3} sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography variant="h4">
                {t('Distribution of expected total score by team')}
              </Typography>
              <Paper variant="outlined" classes={{ root: classes.paperChart }}>
                <ExerciseDistributionScoreOverTimeByTeamInPercentage exerciseId={exerciseId} />
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      }
    </>
  );
};

export default ExerciseInjects;
