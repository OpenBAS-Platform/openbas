import Chart from 'react-apexcharts';
import React, { FunctionComponent } from 'react';
import { useTheme } from '@mui/styles';
import type { ExerciseSimpleStore } from '../../../../actions/exercises/Exercise';
import { useFormatter } from '../../../../components/i18n';
import type { Theme } from '../../../../components/Theme';
import Empty from '../../../../components/Empty';

interface Props {
  exercises: ExerciseSimpleStore[];
}

const ScenarioDistributionByExercise: FunctionComponent<Props> = ({
  exercises = [],
}) => {
  // Standard hooks
  const { t } = useFormatter();
  const theme: Theme = useTheme();

  const exerciseNames = exercises.map((exercise) => exercise.exercise_name);
  const exercisePrevention: number[] = [];
  const exerciseDetection: number[] = [];
  const exerciseHumanResponse: number[] = [];
  exercises.forEach((exercise) => exercise.exercise_global_score?.forEach((score) => {
    if (score.type === 'PREVENTION') {
      exercisePrevention.push(score.distribution?.[0].value ?? 0);
    }
    if (score.type === 'DETECTION') {
      exerciseDetection.push(score.distribution?.[0].value ?? 0);
    }
    if (score.type === 'HUMAN_RESPONSE') {
      exerciseHumanResponse.push(score.distribution?.[0].value ?? 0);
    }
  }));

  const exerciseSeries = exercises.map((exercise) => ({
    name: exercise.exercise_name,
    data: exercise.exercise_global_score?.map((score) => (
      score.distribution?.[0]?.value ?? 0
    )),
  }));

  const series = [{
    name: 'Detection',
    data: exercisePrevention,
  }, {
    name: 'Prevention',
    data: exerciseDetection,
  }, {
    name: 'Human response',
    data: exerciseHumanResponse,
  }];
  const options = {
    chart: {
      background: 'transparent',
      toolbar: {
        show: false,
      },
      foreColor: theme.palette.text?.secondary,
    },
    plotOptions: {
      bar: {
        horizontal: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories: exerciseNames,
      axisBorder: {
        show: false,
      },
    },
    yaxis: {
      axisBorder: {
        show: false,
      },
    },
    theme: {
      mode: theme.palette.mode,
    },
    colors: [theme.palette.primary.main, theme.palette.secondary.main, theme.palette.background.accent],
    grid: {
      borderColor:
        theme.palette.mode === 'dark'
          ? 'rgba(255, 255, 255, .1)'
          : 'rgba(0, 0, 0, .1)',
    },
    tooltip: {
      theme: theme.palette.mode,
    },
  };

  return (
    <>
      {exerciseSeries.length > 0 ? (
        <Chart
          // @ts-expect-error: Need to migrate Chart.js file
          options={options}
          series={series}
          type="bar"
          width="100%"
          height={350}
        />
      ) : (
        <Empty
          message={t(
            'No data to display',
          )}
        />
      )
      }
    </>
  );
};
export default ScenarioDistributionByExercise;
