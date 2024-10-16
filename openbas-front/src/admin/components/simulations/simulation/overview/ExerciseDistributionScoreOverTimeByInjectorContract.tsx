import { useTheme } from '@mui/styles';
import React, { FunctionComponent } from 'react';
import Chart from 'react-apexcharts';
import * as R from 'ramda';
import type { ExerciseStore } from '../../../../../actions/exercises/Exercise';
import { lineChartOptions } from '../../../../../utils/Charts';
import Empty from '../../../../../components/Empty';
import { useFormatter } from '../../../../../components/i18n';
import type { Theme } from '../../../../../components/Theme';
import { useHelper } from '../../../../../store';
import type { InjectHelper } from '../../../../../actions/injects/inject-helper';
import type { InjectExpectation } from '../../../../../utils/api-types';
import type { InjectExpectationStore, InjectStore } from '../../../../../actions/injects/Inject';

interface Props {
  exerciseId: ExerciseStore['exercise_id'];
}

const ExerciseDistributionScoreOverTimeByInjectorContract: FunctionComponent<Props> = ({
  exerciseId,
}) => {
  // Standard hooks
  const { t, nsdt, tPick } = useFormatter();
  const theme: Theme = useTheme();

  // Fetching data
  const { injectsMap, injectExpectations }: { injectsMap: InjectStore[], injectExpectations: InjectExpectationStore[] } = useHelper((helper: InjectHelper) => ({
    injectsMap: helper.getInjectsMap(),
    injectExpectations: helper.getExerciseInjectExpectations(exerciseId),
  }));

  let cumulation = 0;
  const injectsTypesScores = R.pipe(
    R.filter((n: InjectExpectationStore) => !R.isEmpty(n.inject_expectation_results)),
    R.map((n: InjectExpectationStore) => R.assoc(
      'inject_expectation_inject',
      injectsMap[n.inject_expectation_inject] || {},
      n,
    )),
    R.groupBy(R.path(['inject_expectation_inject', 'inject_contract'])),
    R.toPairs,
    R.map((n: [string, InjectExpectationStore[]]) => {
      cumulation = 0;
      return [
        n[0],
        R.pipe(
          R.sortWith([R.ascend(R.prop('inject_expectation_updated_at'))]),
          R.map((i: InjectExpectationStore) => {
            cumulation += i.inject_expectation_score ?? 0;
            return R.assoc('inject_expectation_cumulated_score', cumulation, i);
          }),
        )(n[1]),
      ];
    }),
    R.map((n: [string, Array<InjectExpectationStore & { inject_expectation_cumulated_score: number, inject_expectation_inject: InjectStore }>]) => ({
      name: tPick(n[1][0].inject_expectation_inject.inject_injector_contract?.injector_contract_labels),
      color: n[1][0].inject_injector_contract?.injector_contract_content_parsed?.config?.color,
      data: n[1].map((i: InjectExpectation & { inject_expectation_cumulated_score: number }) => ({
        x: i.inject_expectation_updated_at,
        y: i.inject_expectation_cumulated_score,
      })),
    })),
  )(injectExpectations);

  return (
    <>
      {injectsTypesScores.length > 0 ? (
        <Chart
          options={lineChartOptions(
            theme,
            true,
            nsdt,
            null,
            undefined,
            false,
            true,
          )}
          series={injectsTypesScores}
          type="line"
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

export default ExerciseDistributionScoreOverTimeByInjectorContract;
