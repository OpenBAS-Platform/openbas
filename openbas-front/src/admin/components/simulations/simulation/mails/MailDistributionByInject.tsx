import { useTheme } from '@mui/styles';
import React, { FunctionComponent } from 'react';
import Chart from 'react-apexcharts';
import * as R from 'ramda';
import Empty from '../../../../../components/Empty';
import type { ExerciseStore } from '../../../../../actions/exercises/Exercise';
import { useFormatter } from '../../../../../components/i18n';
import { useAppDispatch } from '../../../../../utils/hooks';
import { useHelper } from '../../../../../store';
import useDataLoader from '../../../../../utils/hooks/useDataLoader';
import { horizontalBarsChartOptions } from '../../../../../utils/Charts';
import type { Theme } from '../../../../../components/Theme';
import type { InjectHelper } from '../../../../../actions/injects/inject-helper';
import { fetchExerciseInjects } from '../../../../../actions/Inject';
import type { Inject } from '../../../../../utils/api-types';

interface Props {
  exerciseId: ExerciseStore['exercise_id'];
}

const MailDistributionByInject: FunctionComponent<Props> = ({
  exerciseId,
}) => {
  // Standard hooks
  const { t } = useFormatter();
  const dispatch = useAppDispatch();
  const theme: Theme = useTheme();

  // Fetching data
  const { injects } = useHelper((helper: InjectHelper) => ({
    injects: helper.getScenarioInjects(exerciseId),
  }));
  useDataLoader(() => {
    dispatch(fetchExerciseInjects(exerciseId));
  });

  const sortedInjectsByCommunicationNumber = R.pipe(
    R.sortWith([R.descend(R.prop('inject_communications_number'))]),
    R.take(10),
  )(injects || []);
  const totalMailsByInjectData = [
    {
      name: t('Total mails'),
      data: sortedInjectsByCommunicationNumber.map((i: Inject) => ({
        x: i.inject_title,
        y: i.inject_communications_number,
      })),
    },
  ];

  return (
    <>
      {sortedInjectsByCommunicationNumber.length > 0 ? (
        <Chart
          options={horizontalBarsChartOptions(theme)}
          series={totalMailsByInjectData}
          type="bar"
          width="100%"
          height={50 + sortedInjectsByCommunicationNumber.length * 50}
        />
      ) : (
        <Empty
          message={t(
            'No data to display or the simulation has not started yet',
          )}
        />
      )}
    </>
  );
};

export default MailDistributionByInject;
