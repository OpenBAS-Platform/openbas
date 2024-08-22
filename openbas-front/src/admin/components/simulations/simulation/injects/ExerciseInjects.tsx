import React, { FunctionComponent, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BarChartOutlined, ReorderOutlined } from '@mui/icons-material';
import { Grid, Paper, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import * as R from 'ramda';
import type { Exercise, Inject, InjectStatus, InjectTestStatus } from '../../../../../utils/api-types';
import { ArticleContext, TeamContext } from '../../../common/Context';
import { useAppDispatch } from '../../../../../utils/hooks';
import { useHelper } from '../../../../../store';
import useDataLoader from '../../../../../utils/hooks/useDataLoader';
import Injects from '../../../common/injects/Injects';
import { fetchExerciseInjectExpectations, fetchExerciseTeams } from '../../../../../actions/Exercise';
import type { ExercisesHelper } from '../../../../../actions/exercises/exercise-helper';
import type { ArticlesHelper } from '../../../../../actions/channels/article-helper';
import type { ChallengeHelper } from '../../../../../actions/helper';
import type { VariablesHelper } from '../../../../../actions/variables/variable-helper';
import { fetchVariablesForExercise } from '../../../../../actions/variables/variable-actions';
import type { InjectHelper } from '../../../../../actions/injects/inject-helper';
import { fetchExerciseArticles } from '../../../../../actions/channels/article-action';
import { articleContextForExercise } from '../articles/ExerciseArticles';
import { teamContextForExercise } from '../teams/ExerciseTeams';
import InjectDistributionByType from '../../../common/injects/InjectDistributionByType';
import InjectDistributionByTeam from '../../../common/injects/InjectDistributionByTeam';
import ExerciseDistributionScoreByTeamInPercentage from '../overview/ExerciseDistributionScoreByTeamInPercentage';
import ExerciseDistributionScoreOverTimeByInjectorContract from '../overview/ExerciseDistributionScoreOverTimeByInjectorContract';
import ExerciseDistributionScoreOverTimeByTeam from '../overview/ExerciseDistributionScoreOverTimeByTeam';
import ExerciseDistributionScoreOverTimeByTeamInPercentage from '../overview/ExerciseDistributionScoreOverTimeByTeamInPercentage';
import { useFormatter } from '../../../../../components/i18n';
import useEntityToggle from '../../../../../utils/hooks/useEntityToggle';
import ToolBar from '../../../common/ToolBar';
import { isNotEmptyField } from '../../../../../utils/utils';
import { fetchExerciseInjectsSimple } from '../../../../../actions/injects/inject-action';
import injectContextForExercise from '../ExerciseContext';
import { bulkTestInjects } from '../../../../../actions/Inject';

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
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { exerciseId } = useParams() as { exerciseId: Exercise['exercise_id'] };

  const { injects, exercise, teams, articles, variables } = useHelper(
    (helper: InjectHelper & ExercisesHelper & ArticlesHelper & ChallengeHelper & VariablesHelper) => {
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
    dispatch(fetchExerciseInjectsSimple(exerciseId));
    dispatch(fetchExerciseTeams(exerciseId));
    dispatch(fetchExerciseArticles(exerciseId));
    dispatch(fetchVariablesForExercise(exerciseId));
    dispatch(fetchExerciseInjectExpectations(exerciseId));
  });

  const articleContext = articleContextForExercise(exerciseId);
  const teamContext = teamContextForExercise(exerciseId, []);

  const injectContext = injectContextForExercise(exercise);

  const [viewMode, setViewMode] = useState('list');
  const {
    selectedElements,
    deSelectedElements,
    selectAll,
    handleClearSelectedElements,
    handleToggleSelectAll,
    onToggleEntity,
    numberOfSelectedElements,
  } = useEntityToggle('inject', injects.length);
  const onRowShiftClick = (currentIndex: number, currentEntity: Inject, event: React.SyntheticEvent | null = null) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    if (selectedElements && !R.isEmpty(selectedElements)) {
      // Find the indexes of the first and last selected entities
      let firstIndex = R.findIndex(
        (n: Inject) => n.inject_id === R.head(R.values(selectedElements)).inject_id,
        injects,
      );
      if (currentIndex > firstIndex) {
        let entities: Inject[] = [];
        while (firstIndex <= currentIndex) {
          entities = [...entities, injects[firstIndex]];
          // eslint-disable-next-line no-plusplus
          firstIndex++;
        }
        const forcedRemove = R.values(selectedElements).filter(
          (n: Inject) => !entities.map((o) => o.inject_id).includes(n.inject_id),
        );
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        return onToggleEntity(entities, event, forcedRemove);
      }
      let entities: Inject[] = [];
      while (firstIndex >= currentIndex) {
        entities = [...entities, injects[firstIndex]];
        // eslint-disable-next-line no-plusplus
        firstIndex--;
      }
      const forcedRemove = R.values(selectedElements).filter(
        (n: Inject) => !entities.map((o) => o.inject_id).includes(n.inject_id),
      );
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      return onToggleEntity(entities, event, forcedRemove);
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    return onToggleEntity(currentEntity, event);
  };

  const injectsToProcess = selectAll
    ? injects.filter((inject: Inject) => !R.keys(deSelectedElements).includes(inject.inject_id))
    : injects.filter(
      (inject: Inject) => R.keys(selectedElements).includes(inject.inject_id) && !R.keys(deSelectedElements).includes(inject.inject_id),
    );

  const massUpdateInjects = async (actions: {
    field: string,
    type: string,
    values: { value: string }[]
  }[]) => {
    const updateFields = [
      'inject_title',
      'inject_description',
      'inject_injector_contract',
      'inject_content',
      'inject_depends_from_another',
      'inject_depends_duration',
      'inject_teams',
      'inject_assets',
      'inject_asset_groups',
      'inject_documents',
      'inject_all_teams',
      'inject_country',
      'inject_city',
      'inject_tags',
    ];
    const injectsToUpdate = injectsToProcess.filter((inject: Inject) => inject.inject_injector_contract?.convertedContent);
    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < actions.length; i++) {
      const action = actions[i];
      // eslint-disable-next-line no-plusplus
      for (let j = 0; j < injectsToUpdate.length; j++) {
        const injectToUpdate = {
          ...injectsToUpdate[j],
          inject_injector_contract: injectsToUpdate[j].inject_injector_contract.injector_contract_id,
        };
        switch (action.type) {
          case 'ADD':
            if (isNotEmptyField(injectToUpdate[`inject_${action.field}`])) {
              injectToUpdate[`inject_${action.field}`] = R.uniq([...injectToUpdate[`inject_${action.field}`], ...action.values.map((n) => n.value)]);
            } else {
              injectToUpdate[`inject_${action.field}`] = R.uniq(action.values.map((n) => n.value));
            }
            // eslint-disable-next-line no-await-in-loop
            await injectContext.onUpdateInject(injectToUpdate.inject_id, R.pick(updateFields, injectToUpdate));
            break;
          case 'REPLACE':
            injectToUpdate[`inject_${action.field}`] = R.uniq(action.values.map((n) => n.value));
            // eslint-disable-next-line no-await-in-loop
            await injectContext.onUpdateInject(injectToUpdate.inject_id, R.pick(updateFields, injectToUpdate));
            break;
          case 'REMOVE':
            if (isNotEmptyField(injectToUpdate[`inject_${action.field}`])) {
              injectToUpdate[`inject_${action.field}`] = injectToUpdate[`inject_${action.field}`].filter((n: string) => !action.values.map((o) => o.value).includes(n));
            } else {
              injectToUpdate[`inject_${action.field}`] = [];
            }
            // eslint-disable-next-line no-await-in-loop
            await injectContext.onUpdateInject(injectToUpdate.inject_id, R.pick(updateFields, injectToUpdate));
            break;
          default:
            return;
        }
      }
    }
  };
  const bulkDeleteInjects = () => {
    injectContext.onBulkDeleteInjects(injectsToProcess.map((inject: Inject) => inject.inject_id));
  };

  const massTestInjects = () => {
    bulkTestInjects(injectsToProcess.map((inject: Inject) => inject.inject_id)).then((result: { data: InjectTestStatus }) => {
      if (numberOfSelectedElements === 1) {
        // @ts-expect-error Data is an array with one element
        navigate(`/admin/exercises/${exercise.exercise_id}/tests/${result.data[0].status_id}`);
      } else {
        navigate(`/admin/exercises/${exercise.exercise_id}/tests`);
      }
    });
  };

  return (
    <>
      {viewMode === 'list' && (
        <ArticleContext.Provider value={articleContext}>
          <TeamContext.Provider value={teamContext}>
            <Injects
              isExercise={true}
              exerciseOrScenarioId={exerciseId}
              injects={injects}
              teams={teams}
              articles={articles}
              variables={variables}
              uriVariable={`/admin/exercises/${exerciseId}/definition/variables`}
              allUsersNumber={exercise.exercise_all_users_number}
              usersNumber={exercise.exercise_users_number}
              teamsUsers={exercise.exercise_teams_users}
              setViewMode={setViewMode}
              onToggleEntity={onToggleEntity}
              onToggleShiftEntity={onRowShiftClick}
              handleToggleSelectAll={handleToggleSelectAll}
              selectedElements={selectedElements}
              deSelectedElements={deSelectedElements}
              selectAll={selectAll}
            />
            <ToolBar
              numberOfSelectedElements={numberOfSelectedElements}
              selectedElements={selectedElements}
              deSelectedElements={deSelectedElements}
              selectAll={selectAll}
              handleClearSelectedElements={handleClearSelectedElements}
              context="exercise"
              id={exercise.exercise_id}
              handleUpdate={massUpdateInjects}
              handleBulkDelete={bulkDeleteInjects}
              handleBulkTest={massTestInjects}
            />
          </TeamContext.Provider>
        </ArticleContext.Provider>
      )}
      {viewMode === 'distribution' && (
        <div style={{ marginTop: -12 }}>
          <ToggleButtonGroup
            size="small"
            exclusive={true}
            style={{ float: 'right' }}
            aria-label="Change view mode"
          >
            <Tooltip title={t('List view')}>
              <ToggleButton
                value="list"
                onClick={() => setViewMode('list')}
                selected={false}
                aria-label="List view mode"
              >
                <ReorderOutlined fontSize="small" color="primary" />
              </ToggleButton>
            </Tooltip>
            <Tooltip title={t('Distribution view')}>
              <ToggleButton
                value="distribution"
                onClick={() => setViewMode('distribution')}
                selected={true}
                aria-label="Distribution view mode"
              >
                <BarChartOutlined fontSize="small" color="inherit" />
              </ToggleButton>
            </Tooltip>
          </ToggleButtonGroup>
          <Grid container spacing={3}>
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
                  {t('Distribution of expectations by inject type')} (%)
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
        </div>
      )}
    </>
  );
};

export default ExerciseInjects;
