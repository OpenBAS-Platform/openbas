import { Grid, Paper, Theme, Typography } from '@mui/material';
import React from 'react';
import { ComputerOutlined, Kayaking, MovieFilterOutlined, PersonOutlined } from '@mui/icons-material';
import { makeStyles, useTheme } from '@mui/styles';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import { useFormatter } from '../../components/i18n';
import PaperMetric from './common/simulate/PaperMetric';
import { useAppDispatch } from '../../utils/hooks';
import { useHelper } from '../../store';
import useDataLoader from '../../utils/ServerSideEvent';
import { fetchStatistics } from '../../actions/Application';
import type { StatisticsHelper } from '../../actions/statistics/statistics-helper';
import ResponsePie from './atomic_testings/atomic_testing/ResponsePie';
import MitreMatrix from './common/matrix/MitreMatrix';
import MitreMatrixDummy from './common/matrix/MitreMatrixDummy';
import { verticalBarsChartOptions } from '../../utils/Charts';
import { fetchExercises } from '../../actions/Exercise';
import type { ExercisesHelper } from '../../actions/exercises/exercise-helper';
import type { Exercise } from '../../utils/api-types';
import { daysAgo, fillTimeSeries, getNextWeek, groupBy } from '../../utils/Time';
import { random } from '../../utils/Number';

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
    height: 300,
    minHeight: 300,
    margin: '10px 0 0 0',
    padding: 15,
    borderRadius: 4,
    display: 'flex',
    alignItems: 'center',
  },
  paperChart: {
    height: 300,
    minHeight: 300,
    margin: '10px 0 0 0',
    padding: 15,
    borderRadius: 4,
  },
}));

const Dashboard = () => {
  // Standard hooks
  const theme: Theme = useTheme();
  const classes = useStyles();
  const { t, fld } = useFormatter();
  const dispatch = useAppDispatch();

  // Fetching data
  const exercises = useHelper((helper: ExercisesHelper) => helper.getExercises());
  const statistics = useHelper((helper: StatisticsHelper) => helper.getStatistics());
  useDataLoader(() => {
    dispatch(fetchExercises());
    dispatch(fetchStatistics());
  });
  useDataLoader(() => {
    dispatch(fetchStatistics());
  });
  const generateFakeData = (): { x: string; y: number }[] => {
    const nowDate = new Date();
    return Array.from(Array(30), () => {
      nowDate.setHours(nowDate.getHours() - 96);
      return {
        x: nowDate.toISOString(),
        y: Math.round(random(5, 50)),
      };
    });
  };

  const exercisesOverTime = groupBy(exercises.filter((e: Exercise) => e.exercise_start_date !== null), 'exercise_start_date', 'week');
  const exercisesTimeSeries = fillTimeSeries(daysAgo(150), getNextWeek(), 'week', exercisesOverTime);
  const exercisesData = [
    {
      name: t('Number of simulations'),
      data: exercises.length === 0 ? generateFakeData() : exercisesTimeSeries.map((grouping: { date: string, value: number }) => ({
        x: grouping.date,
        y: grouping.value,
      })),
    },
  ];

  return (
    <Grid container spacing={3}>
      <Grid item xs={3}>
        <PaperMetric title={t('Scenarios')} icon={<MovieFilterOutlined />} number={statistics?.scenarios_count?.progression_count} />
      </Grid>
      <Grid item xs={3}>
        <PaperMetric title={t('Simulations')} icon={<Kayaking />} number={statistics?.exercises_count?.progression_count} />
      </Grid>
      <Grid item xs={3}>
        <PaperMetric title={t('Players')} icon={<PersonOutlined />} number={statistics?.users_count?.progression_count} />
      </Grid>
      <Grid item xs={3}>
        <PaperMetric title={t('Assets')} icon={<ComputerOutlined />} number={statistics?.assets_count?.progression_count} />
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
              exercises.length === 0,
            ) as ApexOptions}
            series={exercisesData}
            type="bar"
            width="100%"
            height="100%"
          />
        </Paper>
      </Grid>
      <Grid item xs={12} style={{ marginTop: 25 }}>
        <Typography variant="h4">{t('Mitre Coverage')}</Typography>
        <Paper variant="outlined" style={{ minWidth: '100%', padding: 16 }}>
          {(statistics?.inject_expectation_results ?? []).length > 0
            ? <MitreMatrix injectResults={statistics?.inject_expectation_results ?? []} />
            : <MitreMatrixDummy />
            }
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Dashboard;
