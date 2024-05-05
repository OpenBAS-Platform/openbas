import { useParams } from 'react-router-dom';
import React from 'react';
import { Button, Chip, Grid, Paper, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { PlayArrowOutlined } from '@mui/icons-material';
import { useAppDispatch } from '../../../../utils/hooks';
import { useHelper } from '../../../../store';
import type { ScenariosHelper } from '../../../../actions/scenarios/scenario-helper';
import useDataLoader from '../../../../utils/ServerSideEvent';
import type { ScenarioStore } from '../../../../actions/scenarios/Scenario';
import type { ExercisesHelper } from '../../../../actions/exercises/exercise-helper';
import type { ExerciseStore } from '../../../../actions/exercises/Exercise';
import ExerciseList from '../../simulations/ExerciseList';
import ScenarioDistributionByExercise from './ScenarioDistributionByExercise';
import { useFormatter } from '../../../../components/i18n';
import ExpandableMarkdown from '../../../../components/ExpandableMarkdown';
import ItemCategory from '../../../../components/ItemCategory';
import ItemMainFocus from '../../../../components/ItemMainFocus';
import ItemTags from '../../../../components/ItemTags';
import PlatformIcon from '../../../../components/PlatformIcon';
import ItemSeverity from '../../../../components/ItemSeverity';
import type { KillChainPhase } from '../../../../utils/api-types';
import { fetchScenarioExercises } from '../../../../actions/scenarios/scenario-actions';

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
    padding: 15,
    borderRadius: 4,
  },
}));

const Scenario = ({ setOpenScenarioRecurringFormDialog }: { setOpenScenarioRecurringFormDialog: React.Dispatch<React.SetStateAction<boolean>> }) => {
  // Standard hooks
  const classes = useStyles();
  const { t } = useFormatter();
  const dispatch = useAppDispatch();
  const { scenarioId } = useParams() as { scenarioId: ScenarioStore['scenario_id'] };
  // Fetching data
  const { scenario, exercises } = useHelper((helper: ScenariosHelper & ExercisesHelper) => ({
    scenario: helper.getScenario(scenarioId),
    exercises: helper.getExercisesMap(),
  }));
  useDataLoader(() => {
    dispatch(fetchScenarioExercises(scenarioId));
  });
  const scenarioExercises = scenario.scenario_exercises?.map((exerciseId: string) => exercises[exerciseId]).filter((ex: ExerciseStore) => !!ex);
  return (
    <>
      <Grid
        container={true}
        spacing={3}
        classes={{ container: classes.gridContainer }}
      >
        <Grid item={true} xs={6} style={{ paddingTop: 10 }}>
          <Typography variant="h4" gutterBottom={true}>
            {t('Information')}
          </Typography>
          <Paper classes={{ root: classes.paper }} variant="outlined">
            <Grid container={true} spacing={3}>
              <Grid item={true} xs={12} style={{ paddingTop: 10 }}>
                <Typography
                  variant="h3"
                  gutterBottom={true}
                  style={{ marginTop: 20 }}
                >
                  {t('Description')}
                </Typography>
                <ExpandableMarkdown
                  source={scenario.scenario_description}
                  limit={300}
                />
              </Grid>
              <Grid item={true} xs={4} style={{ paddingTop: 10 }}>
                <Typography
                  variant="h3"
                  gutterBottom={true}
                  style={{ marginTop: 20 }}
                >
                  {t('Severity')}
                </Typography>
                <ItemSeverity severity={scenario.scenario_severity} label={t(scenario.scenario_severity ?? 'Unknown')} />
              </Grid>
              <Grid item={true} xs={4} style={{ paddingTop: 10 }}>
                <Typography
                  variant="h3"
                  gutterBottom={true}
                  style={{ marginTop: 20 }}
                >
                  {t('Category')}
                </Typography>
                <ItemCategory category={scenario.scenario_category} label={t(scenario.scenario_category ?? 'Unknown')} />
              </Grid>
              <Grid item={true} xs={4} style={{ paddingTop: 10 }}>
                <Typography
                  variant="h3"
                  gutterBottom={true}
                  style={{ marginTop: 20 }}
                >
                  {t('Main Focus')}
                </Typography>
                <ItemMainFocus mainFocus={scenario.scenario_main_focus} label={t(scenario.scenario_main_focus ?? 'Unknown')} />
              </Grid>
              <Grid item={true} xs={4} style={{ paddingTop: 10 }}>
                <Typography
                  variant="h3"
                  gutterBottom={true}
                  style={{ marginTop: 20 }}
                >
                  {t('Tags')}
                </Typography>
                <ItemTags tags={scenario.scenario_tags} />
              </Grid>
              <Grid item={true} xs={4} style={{ paddingTop: 10 }}>
                <Typography
                  variant="h3"
                  gutterBottom={true}
                  style={{ marginTop: 20 }}
                >
                  {t('Platforms')}
                </Typography>
                {(scenario.scenario_platforms ?? []).length === 0 ? (
                  <PlatformIcon platform={t('No inject in this scenario')} tooltip={true} width={25} />
                ) : scenario.scenario_platforms.map(
                  (platform: string) => <PlatformIcon key={platform} platform={platform} tooltip={true} width={25} marginRight={10} />,
                )}
              </Grid>
              <Grid item={true} xs={4} style={{ paddingTop: 10 }}>
                <Typography
                  variant="h3"
                  gutterBottom={true}
                  style={{ marginTop: 20 }}
                >
                  {t('Kill Chain Phases')}
                </Typography>
                {(scenario.exercise_kill_chain_phases ?? []).length === 0 && '-'}
                {scenario.exercise_kill_chain_phases?.map((killChainPhase: KillChainPhase) => (
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
        <Grid item={true} xs={6} style={{ paddingTop: 10 }}>
          <Typography variant="h4" gutterBottom={true}>
            {t('Simulations Results')}
          </Typography>
          <Paper classes={{ root: classes.paper }} variant="outlined">
            <ScenarioDistributionByExercise exercises={scenarioExercises}/>
          </Paper>
        </Grid>
      </Grid>
      <div style={{ marginTop: 50 }}>
        <ExerciseList exercises={scenarioExercises} withoutSearch={true} />
      </div>
      {(scenarioExercises ?? 0).length === 0 && (
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
            onClick={() => setOpenScenarioRecurringFormDialog(true)}
          >
            {t('Simulate Now')}
          </Button>
        </div>
      )}
    </>
  );
};

export default Scenario;
