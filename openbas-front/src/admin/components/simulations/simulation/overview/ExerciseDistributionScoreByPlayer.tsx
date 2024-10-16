import React, { FunctionComponent } from 'react';
import Chart from 'react-apexcharts';
import { useTheme } from '@mui/styles';
import * as R from 'ramda';
import type { ExerciseStore } from '../../../../../actions/exercises/Exercise';
import { horizontalBarsChartOptions } from '../../../../../utils/Charts';
import Empty from '../../../../../components/Empty';
import { useFormatter } from '../../../../../components/i18n';
import type { Theme } from '../../../../../components/Theme';
import { useHelper } from '../../../../../store';
import type { InjectHelper } from '../../../../../actions/injects/inject-helper';
import { resolveUserName } from '../../../../../utils/String';
import type { UserHelper } from '../../../../../actions/helper';
import type { InjectExpectation, User } from '../../../../../utils/api-types';
import type { InjectExpectationStore } from '../../../../../actions/injects/Inject';

interface Props {
  exerciseId: ExerciseStore['exercise_id'];
}

const ExerciseDistributionScoreByPlayer: FunctionComponent<Props> = ({
  exerciseId,
}) => {
  // Standard hooks
  const { t } = useFormatter();
  const theme: Theme = useTheme();

  // Fetching data
  const { injectExpectations, usersMap } = useHelper((helper: InjectHelper & UserHelper) => ({
    injectExpectations: helper.getExerciseInjectExpectations(exerciseId),
    usersMap: helper.getUsersMap(),
  }));

  const usersTotalScores = R.pipe(
    R.filter(
      (n: InjectExpectation) => !R.isEmpty(n.inject_expectation_results)
        && n.inject_expectation_user !== null,
    ),
    R.groupBy(R.prop('inject_expectation_user')),
    R.toPairs,
    R.map((n: [string, InjectExpectationStore[]]) => ({
      ...usersMap[n[0]],
      user_total_score: R.sum(R.map((o: InjectExpectationStore) => o.inject_expectation_score, n[1])),
    })),
  )(injectExpectations);

  const sortedUsersByTotalScore = R.pipe(
    R.sortWith([R.descend(R.prop('user_total_score'))]),
    R.take(10),
  )(usersTotalScores);

  const totalScoreByUserData = [
    {
      name: t('Total score'),
      data: sortedUsersByTotalScore.map((u: User & { user_total_score: number }) => ({
        x: resolveUserName(u),
        y: u.user_total_score,
      })),
    },
  ];

  return (
    <>
      {usersTotalScores.length > 0 ? (
        <Chart
          options={horizontalBarsChartOptions(theme)}
          series={totalScoreByUserData}
          type="bar"
          width="100%"
          height={50 + usersTotalScores.length * 50}
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
export default ExerciseDistributionScoreByPlayer;
