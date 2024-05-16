import { Grid, Paper, Theme, Typography } from '@mui/material';
import React from 'react';
import * as R from 'ramda';
import { ComputerOutlined, HubOutlined, MovieFilterOutlined, PersonOutlined } from '@mui/icons-material';
import { makeStyles, useTheme } from '@mui/styles';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { useFormatter } from '../../components/i18n';
import PaperMetric from './common/simulate/PaperMetric';
import { useAppDispatch } from '../../utils/hooks';
import { useHelper } from '../../store';
import useDataLoader from '../../utils/hooks/useDataLoader';
import { fetchStatistics } from '../../actions/Application';
import type { StatisticsHelper } from '../../actions/statistics/statistics-helper';
import ResponsePie from './common/injects/ResponsePie';
import MitreMatrix from './common/matrix/MitreMatrix';
import MitreMatrixDummy from './common/matrix/MitreMatrixDummy';
import { horizontalBarsChartOptions, polarAreaChartOptions, verticalBarsChartOptions } from '../../utils/Charts';
import { fetchExercises } from '../../actions/Exercise';
import type { ExercisesHelper } from '../../actions/exercises/exercise-helper';
import type { ExerciseSimple } from '../../utils/api-types';
import { daysAgo, fillTimeSeries, getNextWeek, groupBy } from '../../utils/Time';
import ExerciseList from './simulations/ExerciseList';
import type { AttackPatternHelper } from '../../actions/attack_patterns/attackpattern-helper';
import type { KillChainPhaseHelper } from '../../actions/kill_chain_phases/killchainphase-helper';
import type { InjectorHelper } from '../../actions/injectors/injector-helper';
import { fetchKillChainPhases } from '../../actions/KillChainPhase';
import { fetchAttackPatterns } from '../../actions/AttackPattern';
import Empty from '../../components/Empty';
import { attackPatternsFakeData, categoriesDataFakeData, categoriesLabelsFakeData, exercisesTimeSeriesFakeData } from '../../utils/fakeData';

// Deprecated - https://mui.com/system/styles/basics/
// Do not use it for new code.
const useStyles = makeStyles(() => ({
  paper: {
    height: '100%',
    minHeight: '100%',
    margin: '10px 0 0 0',
    padding: 15,
    borderRadius: 4,
  },
  paperWithChart: {
    height: 320,
    minHeight: 320,
    margin: '10px 0 0 0',
    padding: 15,
    borderRadius: 4,
    display: 'flex',
    alignItems: 'center',
  },
  paperList: {
    height: 320,
    minHeight: 320,
    margin: '10px 0 0 0',
    padding: 0,
    borderRadius: 4,
  },
  paperChart: {
    height: 320,
    minHeight: 320,
    margin: '10px 0 0 0',
    padding: 15,
    borderRadius: 4,
  },
}));

const Dashboard = () => {
  // Standard hooks
  const theme: Theme = useTheme();
  const classes = useStyles();
  const { t, fld, n } = useFormatter();
  const dispatch = useAppDispatch();

  // Fetching data
  const exercises = useHelper((helper: ExercisesHelper) => helper.getExercises());
  const statistics = useHelper((helper: StatisticsHelper) => helper.getStatistics());
  useDataLoader(() => {
    dispatch(fetchKillChainPhases());
    dispatch(fetchExercises());
    dispatch(fetchStatistics());
    dispatch(fetchAttackPatterns());
  });
  const { attackPatterns } = useHelper((helper: AttackPatternHelper & KillChainPhaseHelper & InjectorHelper) => ({
    attackPatterns: helper.getAttackPatterns(),
    killChainPhasesMap: helper.getKillChainPhasesMap(),
  }));
  const exercisesOverTime = groupBy(exercises.filter((e: ExerciseSimple) => e.exercise_start_date !== null), 'exercise_start_date', 'week');
  const exercisesTimeSeries = fillTimeSeries(daysAgo(150), getNextWeek(), 'week', exercisesOverTime);
  const exercisesData = [
    {
      name: t('Number of simulations'),
      data: exercisesOverTime.length === 0 ? exercisesTimeSeriesFakeData : exercisesTimeSeries.map((grouping: { date: string, value: number }) => ({
        x: grouping.date,
        y: grouping.value,
      })),
    },
  ];
  const countByCategory = R.countBy((exercise: ExerciseSimple) => exercise?.exercise_category || t('Unknown'), exercises);
  const categoriesLabels: string[] = R.keys(countByCategory).length === 0 ? categoriesLabelsFakeData : R.keys(countByCategory);
  const categoriesData: number[] = R.values(countByCategory).length === 0 ? categoriesDataFakeData : R.values(countByCategory);
  const sortByY = R.sortWith([R.descend(R.prop('y'))]);
  const attackPatternsData = attackPatterns.length > 0 ? sortByY(attackPatternsFakeData) : [];
  return (
    <Grid container spacing={3}>
      <Grid item xs={3}>
        <PaperMetric title={t('Scenarios')} icon={<MovieFilterOutlined />}
          number={statistics?.scenarios_count?.global_count}
          progression={statistics?.scenarios_count?.progression_count}
        />
      </Grid>
      <Grid item xs={3}>
        <PaperMetric title={t('Simulations')} icon={<HubOutlined />}
          number={statistics?.exercises_count?.global_count}
          progression={statistics?.exercises_count?.progression_count}
        />
      </Grid>
      <Grid item xs={3}>
        <PaperMetric title={t('Players')} icon={<PersonOutlined />}
          number={statistics?.users_count?.global_count}
          progression={statistics?.users_count?.progression_count}
        />
      </Grid>
      <Grid item xs={3}>
        <PaperMetric title={t('Assets')} icon={<ComputerOutlined />}
          number={statistics?.assets_count?.global_count}
          progression={statistics?.assets_count?.progression_count}
        />
      </Grid>
      <Grid item xs={6}>
        <Typography variant="h4">{t('Performance Overview')}</Typography>
        <Paper variant="outlined" classes={{ root: classes.paperWithChart }}>
          <ResponsePie expectationResultsByTypes={statistics?.expectation_results ?? []} immutable={true} />
        </Paper>
      </Grid>
      <Grid item={true} xs={6}>
        <Typography variant="h4">{t('Simulations')}</Typography>
        <Paper variant="outlined" classes={{ root: classes.paperChart }}>
          <Chart
            options={verticalBarsChartOptions(
              theme,
              fld,
              undefined,
              false,
              true,
              false,
              true,
              'dataPoints',
              true,
              exercisesOverTime.length === 0,
            ) as ApexOptions}
            series={exercisesData}
            type="bar"
            width="100%"
            height="100%"
          />
        </Paper>
      </Grid>
      <Grid item={true} xs={3}>
        <Typography variant="h4">{t('Top simulation categories')}</Typography>
        <Paper variant="outlined" classes={{ root: classes.paperChart }}>
          <Chart
            options={polarAreaChartOptions(
              theme,
              categoriesLabels,
              undefined,
              'bottom',
              [],
              R.keys(countByCategory).length > 0,
              R.keys(countByCategory).length === 0,
            ) as ApexOptions}
            series={categoriesData}
            type="polarArea"
            width="100%"
            height="100%"
          />
        </Paper>
      </Grid>
      <Grid item={true} xs={3}>
        <Typography variant="h4">{t('Top attack patterns')}</Typography>
        <Paper variant="outlined" classes={{ root: classes.paperChart }}>
          <Chart
            options={horizontalBarsChartOptions(
              theme,
              true,
              n,
              undefined,
              false,
              false,
              undefined,
              undefined,
              true,
              true,
            ) as ApexOptions}
            series={attackPatternsData}
            type="bar"
            width="100%"
            height="100%"
          />
        </Paper>
      </Grid>
      <Grid item={true} xs={6}>
        <Typography variant="h4">{t('Last simulations')}</Typography>
        <Paper variant="outlined" classes={{ root: classes.paperList }}>
          {exercises.length === 0 && <Empty message={t('No simulation in this platform yet.')} />}
          <ExerciseList exercises={exercises} withoutSearch={true} limit={6} />
        </Paper>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="h4">{t('MITRE ATT&CK Coverage')}</Typography>
        <Paper variant="outlined" style={{ minWidth: '100%', padding: 16 }}>
          {(statistics?.inject_expectation_results ?? []).length > 0
            ? <MitreMatrix alreadyLoaded={true} injectResults={statistics?.inject_expectation_results ?? []} />
            : <MitreMatrixDummy />
          }
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Dashboard;
