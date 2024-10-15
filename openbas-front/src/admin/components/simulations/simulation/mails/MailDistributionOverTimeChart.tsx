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
import { fetchExerciseCommunications } from '../../../../../actions/Communication';
import type { CommunicationHelper } from '../../../../../actions/communications/communication-helper';
import type { Communication } from '../../../../../utils/api-types';
import { areaChartOptions } from '../../../../../utils/Charts';
import type { Theme } from '../../../../../components/Theme';

interface Props {
  exerciseId: ExerciseStore['exercise_id'];
}

const MailDistributionOverTimeChart: FunctionComponent<Props> = ({
  exerciseId,
}) => {
  // Standard hooks
  const { t, nsdt } = useFormatter();
  const dispatch = useAppDispatch();
  const theme: Theme = useTheme();

  // Fetching data
  const { communications } = useHelper((helper: CommunicationHelper) => ({
    communications: helper.getExerciseCommunications(exerciseId),
  }));
  useDataLoader(() => {
    dispatch(fetchExerciseCommunications(exerciseId));
  });

  let cumulation = 0;
  const communicationsOverTime = R.pipe(
    R.sortWith([R.ascend(R.prop('communication_received_at'))]),
    R.map((i: Communication) => {
      cumulation += 1;
      return R.assoc('communication_cumulated_number', cumulation, i);
    }),
  )(communications);
  const communicationsData = [
    {
      name: t('Total mails'),
      data: communicationsOverTime.map((c: Communication & { communication_cumulated_number: number }) => ({
        x: c.communication_received_at,
        y: c.communication_cumulated_number,
      })),
    },
  ];

  return (
    <>
      {communicationsOverTime.length > 0 ? (
        <Chart
          options={areaChartOptions(theme, true, nsdt, null, undefined)}
          series={communicationsData}
          type="area"
          width="100%"
          height={350}
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

export default MailDistributionOverTimeChart;
