import Chart from 'react-apexcharts';
import React, { FunctionComponent } from 'react';
import { useTheme } from '@mui/styles';
import * as R from 'ramda';
import { lineChartOptions } from '../../../../../utils/Charts';
import Empty from '../../../../../components/Empty';
import type { ExerciseStore } from '../../../../../actions/exercises/Exercise';
import { useFormatter } from '../../../../../components/i18n';
import type { Theme } from '../../../../../components/Theme';
import type { InjectExpectation } from '../../../../../utils/api-types';
import { useHelper } from '../../../../../store';
import type { InjectHelper } from '../../../../../actions/injects/inject-helper';
import type { TeamsHelper } from '../../../../../actions/teams/team-helper';
import { computeTeamsColors } from './DistributionUtils';
import type { InjectExpectationStore } from '../../../../../actions/injects/Inject';

interface Props {
  exerciseId: ExerciseStore['exercise_id'];
}

const ExerciseDistributionScoreOverTimeByTeam: FunctionComponent<Props> = ({
  exerciseId,
}) => {
  // Standard hooks
  const { t, nsdt } = useFormatter();
  const theme: Theme = useTheme();

  // Fetching data
  const { injectExpectations, teams, teamsMap } = useHelper((helper: InjectHelper & TeamsHelper) => ({
    injectExpectations: helper.getExerciseInjectExpectations(exerciseId),
    teams: helper.getExerciseTeams(exerciseId),
    teamsMap: helper.getTeamsMap(),
  }));

  const teamsColors = computeTeamsColors(teams, theme);

  let cumulation = 0;
  const teamsScores = R.pipe(
    R.filter((n: InjectExpectationStore) => !R.isEmpty(n.inject_expectation_results) && n?.inject_expectation_team),
    R.groupBy(R.prop('inject_expectation_team')),
    R.toPairs,
    R.map((n: [string, InjectExpectationStore[]]) => {
      cumulation = 0;
      return [
        n[0],
        R.pipe(
          R.sortWith([R.ascend(R.prop('inject_expectation_updated_at'))]),
          R.map((i: InjectExpectation) => {
            cumulation += i.inject_expectation_score ?? 0;
            return R.assoc('inject_expectation_cumulated_score', cumulation, i);
          }),
        )(n[1]),
      ];
    }),
    R.map((n: [string, Array<InjectExpectationStore & { inject_expectation_cumulated_score: number }>]) => ({
      name: teamsMap[n[0]]?.team_name,
      color: teamsColors[n[0]],
      data: n[1].map((i: InjectExpectationStore & { inject_expectation_cumulated_score: number }) => ({
        x: i.inject_expectation_updated_at,
        y: i.inject_expectation_cumulated_score,
      })),
    })),
  )(injectExpectations);

  return (
    <>
      {teamsScores.length > 0 ? (
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
          series={teamsScores}
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
export default ExerciseDistributionScoreOverTimeByTeam;
