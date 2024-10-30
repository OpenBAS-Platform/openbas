import { useTheme } from '@mui/styles';
import * as R from 'ramda';
import { FunctionComponent } from 'react';
import Chart from 'react-apexcharts';

import type { ExerciseStore } from '../../../../../actions/exercises/Exercise';
import type { InjectExpectationStore } from '../../../../../actions/injects/Inject';
import type { InjectHelper } from '../../../../../actions/injects/inject-helper';
import Empty from '../../../../../components/Empty';
import { useFormatter } from '../../../../../components/i18n';
import type { Theme } from '../../../../../components/Theme';
import { useHelper } from '../../../../../store';
import type { Inject } from '../../../../../utils/api-types';
import { horizontalBarsChartOptions } from '../../../../../utils/Charts';

interface Props {
  exerciseId: ExerciseStore['exercise_id'];
}

const ExerciseDistributionScoreByInject: FunctionComponent<Props> = ({
  exerciseId,
}) => {
  // Standard hooks
  const { t } = useFormatter();
  const theme: Theme = useTheme();

  // Fetching data
  const { injectsMap, injectExpectations } = useHelper((helper: InjectHelper) => ({
    injectsMap: helper.getInjectsMap(),
    injectExpectations: helper.getExerciseInjectExpectations(exerciseId),
  }));

  const injectsTotalScores = R.pipe(
    R.filter((n: InjectExpectationStore) => !R.isEmpty(n.inject_expectation_results)),
    R.groupBy(R.prop('inject_expectation_inject')),
    R.toPairs,
    R.map((n: [string, InjectExpectationStore[]]) => ({
      ...injectsMap[n[0]],
      inject_total_score: R.sum(R.map((o: InjectExpectationStore) => o.inject_expectation_score, n[1])),
    })),
  )(injectExpectations);

  const sortedInjectsByTotalScore = R.pipe(
    R.sortWith([R.descend(R.prop('inject_total_score'))]),
    R.take(10),
  )(injectsTotalScores);

  const totalScoreByInjectData = [
    {
      name: t('Total score'),
      data: sortedInjectsByTotalScore.map((i: Inject & { inject_total_score: number }) => ({
        x: i.inject_title,
        y: i.inject_total_score,
      })),
    },
  ];

  return (
    <>
      {injectsTotalScores.length > 0 ? (
        <Chart
          id="exercise_distribution_total_score_by_inject"
          options={horizontalBarsChartOptions(
            theme,
            false,
            undefined,
            undefined,
            true,
          )}
          series={totalScoreByInjectData}
          type="bar"
          width="100%"
          height={50 + injectsTotalScores.length * 50}
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
export default ExerciseDistributionScoreByInject;
