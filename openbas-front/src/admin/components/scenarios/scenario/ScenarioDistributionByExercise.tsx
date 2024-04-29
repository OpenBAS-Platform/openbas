import Chart from 'react-apexcharts';
import React, { FunctionComponent } from 'react';
import { useTheme } from '@mui/styles';
import type { ApexOptions } from 'apexcharts';
import type { ExerciseSimpleStore } from '../../../../actions/exercises/Exercise';
import { useFormatter } from '../../../../components/i18n';
import type { Theme } from '../../../../components/Theme';
import Empty from '../../../../components/Empty';
import { verticalBarsChartOptions } from '../../../../utils/Charts';
import { random } from '../../../../utils/Number';

interface Props {
  exercises: ExerciseSimpleStore[];
}

const generateFakeData = (): ExerciseSimpleStore[] => {
  const now = new Date();
  return Array.from(Array(5), (e, i) => {
    now.setHours(now.getHours() + 1);
    return {
      exercise_id: `fake-${i}`,
      exercise_name: 'fake',
      exercise_start_date: now.toISOString(),
      exercise_global_score: [
        { type: 'PREVENTION', distribution: [{ value: random(10, 100) }] },
        { type: 'DETECTION', distribution: [{ value: random(10, 100) }] },
        { type: 'HUMAN_RESPONSE', distribution: [{ value: random(10, 100) }] },
      ],
      exercise_targets: [],
      exercise_tags: undefined,
    };
  });
};
const ScenarioDistributionByExercise: FunctionComponent<Props> = ({
  exercises = [],
}) => {
  // Standard hooks
  const { t, nsdt } = useFormatter();
  const theme: Theme = useTheme();
  const data = exercises.length > 1 ? exercises : generateFakeData();
  const series = [
    {
      name: t('Prevention'),
      data: data.map((exercise) => ({
        x: new Date(exercise.exercise_start_date ?? 0),
        y: exercise.exercise_global_score?.filter((score) => score.type === 'PREVENTION').at(0)?.distribution?.[0].value ?? 100,
      })),
    },
    {
      name: t('Detection'),
      data: data.map((exercise) => ({
        x: new Date(exercise.exercise_start_date ?? 0),
        y: exercise.exercise_global_score?.filter((score) => score.type === 'DETECTION').at(0)?.distribution?.[0].value ?? 10,
      })),
    },
    {
      name: t('Human Response'),
      data: data.map((exercise) => ({
        x: new Date(exercise.exercise_start_date ?? 0),
        y: exercise.exercise_global_score?.filter((score) => score.type === 'HUMAN_RESPONSE').at(0)?.distribution?.[0].value ?? 10,
      })),
    },
  ];
  return (
    <>
      {data.length > 0 ? (
        <Chart
          options={verticalBarsChartOptions(
            theme,
            nsdt,
            (value: number) => `${value}%`,
            false,
            true,
            false,
            true,
            'dataPoints',
            true,
            exercises.length === 0,
          ) as ApexOptions}
          series={series}
          type="bar"
          width="100%"
          height={300}
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
