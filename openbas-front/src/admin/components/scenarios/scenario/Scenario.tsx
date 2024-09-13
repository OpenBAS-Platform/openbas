import { Link, useParams } from 'react-router-dom';
import React, { useState } from 'react';
import { Avatar, Button, Chip, Grid, Paper, Typography } from '@mui/material';
import { makeStyles, useTheme } from '@mui/styles';
import { PlayArrowOutlined } from '@mui/icons-material';
import * as R from 'ramda';
import { useAppDispatch } from '../../../../utils/hooks';
import { useHelper } from '../../../../store';
import octiDark from '../../../../static/images/xtm/octi_dark.png';
import octiLight from '../../../../static/images/xtm/octi_light.png';
import type { ScenariosHelper } from '../../../../actions/scenarios/scenario-helper';
import useDataLoader from '../../../../utils/hooks/useDataLoader';
import type { ScenarioStore } from '../../../../actions/scenarios/Scenario';
import type { ExercisesHelper } from '../../../../actions/exercises/exercise-helper';
import type { ExerciseStore } from '../../../../actions/exercises/Exercise';
import ScenarioDistributionByExercise from './ScenarioDistributionByExercise';
import { useFormatter } from '../../../../components/i18n';
import ExpandableMarkdown from '../../../../components/ExpandableMarkdown';
import ItemCategory from '../../../../components/ItemCategory';
import ItemMainFocus from '../../../../components/ItemMainFocus';
import ItemTags from '../../../../components/ItemTags';
import PlatformIcon from '../../../../components/PlatformIcon';
import ItemSeverity from '../../../../components/ItemSeverity';
import type { KillChainPhase } from '../../../../utils/api-types';
import { fetchScenarioExercises, searchScenarioExercises } from '../../../../actions/scenarios/scenario-actions';
import type { Theme } from '../../../../components/Theme';
import { isEmptyField } from '../../../../utils/utils';
import type { EndpointStore } from '../../assets/endpoints/Endpoint';
import { initSorting } from '../../../../components/common/queryable/Page';
import ExerciseList from '../../simulations/ExerciseList';
import { useQueryableWithLocalStorage } from '../../../../components/common/queryable/useQueryableWithLocalStorage';
import PaginationComponentV2 from '../../../../components/common/queryable/pagination/PaginationComponentV2';
import ExercisePopover from '../../simulations/simulation/ExercisePopover';
import { buildSearchPagination } from '../../../../components/common/queryable/QueryableUtils';

// Deprecated - https://mui.com/system/styles/basics/
// Do not use it for new code.
const useStyles = makeStyles(() => ({
  chip: {
    fontSize: 12,
    height: 25,
    margin: '0 7px 7px 0',
    textTransform: 'uppercase',
    borderRadius: 4,
    width: 180,
  },
  gridContainer: {
    marginBottom: 20,
  },
  paper: {
    height: '100%',
    minHeight: '100%',
    margin: '10px 0 0 0',
    padding: '15px 15px 0 15px',
    borderRadius: 4,
  },
}));

const Scenario = ({ setOpenInstantiateSimulationAndStart }: { setOpenInstantiateSimulationAndStart: React.Dispatch<React.SetStateAction<boolean>> }) => {
  // Standard hooks
  const classes = useStyles();
  const theme = useTheme<Theme>();
  const { t } = useFormatter();
  const dispatch = useAppDispatch();
  const { scenarioId } = useParams() as { scenarioId: ScenarioStore['scenario_id'] };
  // Fetching data
  const { scenario, exercises: exercisesFromStore } = useHelper((helper: ScenariosHelper & ExercisesHelper) => ({
    scenario: helper.getScenario(scenarioId),
    exercises: helper.getExercisesMap(),
  }));
  useDataLoader(() => {
    dispatch(fetchScenarioExercises(scenarioId));
  });
  const scenarioExercises = scenario.scenario_exercises?.map((exerciseId: string) => exercisesFromStore[exerciseId]).filter((ex: ExerciseStore) => !!ex);
  const sortByOrder = R.sortWith([R.ascend(R.prop('phase_order'))]);

  // Exercises
  const [exercises, setExercises] = useState<EndpointStore[]>([]);
  const { queryableHelpers, searchPaginationInput } = useQueryableWithLocalStorage(`scenario-${scenarioId}-simulations`, buildSearchPagination({
    sorts: initSorting('exercise_start_date'),
  }));
  const secondaryAction = (exercise: ExerciseStore) => (
    <ExercisePopover
      exercise={exercise}
      actions={['Duplicate', 'Export', 'Delete']}
      onDelete={(result) => setExercises(exercises.filter((e) => (e.exercise_id !== result)))}
      inList
    />
  );
  return (
    <>
      <Grid
        container
        spacing={3}
        classes={{ container: classes.gridContainer }}
      >
        <Grid item xs={6} style={{ paddingTop: 10 }}>
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h4" gutterBottom>
              {t('Information')}
            </Typography>
            <Button
              component={Link}
              to={scenario.scenario_external_url}
              target="_blank"
              size="small"
              variant="outlined"
              startIcon={<Avatar style={{ width: 20, height: 20 }} src={theme.palette.mode === 'dark' ? octiDark : octiLight} alt="OCTI" />}
              disabled={isEmptyField(scenario.scenario_external_url)}
            >
              {t('Threat intelligence')}
            </Button>
          </div>
          <Paper classes={{ root: classes.paper }} variant="outlined">
            <Grid container spacing={3}>
              <Grid item xs={12} style={{ paddingTop: 10 }}>
                <Typography
                  variant="h3"
                  gutterBottom
                  style={{ marginTop: 20 }}
                >
                  {t('Description')}
                </Typography>
                <ExpandableMarkdown
                  source={scenario.scenario_description}
                  limit={300}
                />
              </Grid>
              <Grid item xs={4} style={{ paddingTop: 10 }}>
                <Typography
                  variant="h3"
                  gutterBottom
                  style={{ marginTop: 20 }}
                >
                  {t('Severity')}
                </Typography>
                <ItemSeverity severity={scenario.scenario_severity} label={t(scenario.scenario_severity ?? 'Unknown')} />
              </Grid>
              <Grid item xs={4} style={{ paddingTop: 10 }}>
                <Typography
                  variant="h3"
                  gutterBottom
                  style={{ marginTop: 20 }}
                >
                  {t('Category')}
                </Typography>
                <ItemCategory category={scenario.scenario_category} label={t(scenario.scenario_category ?? 'Unknown')} />
              </Grid>
              <Grid item xs={4} style={{ paddingTop: 10 }}>
                <Typography
                  variant="h3"
                  gutterBottom
                  style={{ marginTop: 20 }}
                >
                  {t('Main Focus')}
                </Typography>
                <ItemMainFocus mainFocus={scenario.scenario_main_focus} label={t(scenario.scenario_main_focus ?? 'Unknown')} />
              </Grid>
              <Grid item xs={4} style={{ paddingTop: 10 }}>
                <Typography
                  variant="h3"
                  gutterBottom
                  style={{ marginTop: 20 }}
                >
                  {t('Tags')}
                </Typography>
                <ItemTags tags={scenario.scenario_tags} limit={10} />
              </Grid>
              <Grid item xs={4} style={{ paddingTop: 10 }}>
                <Typography
                  variant="h3"
                  gutterBottom
                  style={{ marginTop: 20 }}
                >
                  {t('Platforms')}
                </Typography>
                {(scenario.scenario_platforms ?? []).length === 0 ? (
                  <PlatformIcon platform={t('No inject in this scenario')} tooltip width={25} />
                ) : scenario.scenario_platforms.map(
                  (platform: string) => <PlatformIcon key={platform} platform={platform} tooltip width={25} marginRight={10} />,
                )}
              </Grid>
              <Grid item xs={4} style={{ paddingTop: 10 }}>
                <Typography
                  variant="h3"
                  gutterBottom
                  style={{ marginTop: 20 }}
                >
                  {t('Kill Chain Phases')}
                </Typography>
                {(scenario.scenario_kill_chain_phases ?? []).length === 0 && '-'}
                {sortByOrder(scenario.scenario_kill_chain_phases ?? [])?.map((killChainPhase: KillChainPhase) => (
                  <Chip
                    key={killChainPhase.phase_id}
                    variant="outlined"
                    classes={{ root: classes.chip }}
                    color="error"
                    label={killChainPhase.phase_name}
                  />
                ))}
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item xs={6} style={{ paddingTop: 10 }}>
          <Typography variant="h4" gutterBottom style={{ margin: '9px 0 17px 0' }}>
            {t('Simulations Results')}
          </Typography>
          <Paper classes={{ root: classes.paper }} variant="outlined">
            <ScenarioDistributionByExercise exercises={scenarioExercises}/>
          </Paper>
        </Grid>
        {(scenarioExercises ?? 0).length > 0 && (
          <Grid item xs={12} style={{ marginTop: 35 }}>
            <Typography variant="h4" gutterBottom style={{ marginBottom: 15 }}>
              {t('Simulations')}
            </Typography>
            <Paper classes={{ root: classes.paper }} variant="outlined">
              <PaginationComponentV2
                fetch={(input) => searchScenarioExercises(scenarioId, input)}
                searchPaginationInput={searchPaginationInput}
                setContent={setExercises}
                entityPrefix="exercise"
                availableFilterNames={['exercise_kill_chain_phases', 'exercise_scenario', 'exercise_tags']}
                queryableHelpers={queryableHelpers}
                searchEnable={false}
              />
              <ExerciseList
                exercises={exercises}
                queryableHelpers={queryableHelpers}
                secondaryAction={secondaryAction}
              />
            </Paper>
          </Grid>
        )}
      </Grid>
      {(scenarioExercises ?? 0).length === 0 && !scenario.scenario_recurrence && (
        <div style={{ marginTop: 100, textAlign: 'center' }}>
          <div style={{ fontSize: 20 }}>
            {t('This scenario has never run, schedule or run it now!')}
          </div>
          <Button
            style={{ marginTop: 20 }}
            startIcon={<PlayArrowOutlined />}
            variant="contained"
            color="primary"
            size="large"
            onClick={() => setOpenInstantiateSimulationAndStart(true)}
          >
            {t('Launch simulation now')}
          </Button>
        </div>
      )}
      {(scenarioExercises ?? 0).length === 0 && scenario.scenario_recurrence && (
      <div style={{ marginTop: 100, textAlign: 'center' }}>
        <div style={{ fontSize: 20 }}>
          {t('This scenario is scheduled to run, results will appear soon.')}
        </div>
      </div>
      )}
    </>
  );
};

export default Scenario;
