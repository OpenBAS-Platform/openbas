import React, { FunctionComponent } from 'react';
import Chart from 'react-apexcharts';
import { useTheme } from '@mui/styles';
import * as R from 'ramda';
import type { ExerciseStore } from '../../../../../actions/exercises/Exercise';
import { horizontalBarsChartOptions } from '../../../../../utils/Charts';
import Empty from '../../../../../components/Empty';
import { useFormatter } from '../../../../../components/i18n';
import type { Theme } from '../../../../../components/Theme';
import type { InjectExpectation } from '../../../../../utils/api-types';
import { useHelper } from '../../../../../store';
import type { InjectHelper } from '../../../../../actions/injects/inject-helper';
import type { TeamsHelper } from '../../../../../actions/teams/team-helper';
import type { TeamStore } from '../../../../../actions/teams/Team';
import { computeTeamsColors } from './DistributionUtils';
import type { InjectExpectationStore } from '../../../../../actions/injects/Inject';

interface Props {
  exerciseId: ExerciseStore['exercise_id'];
}

const ExerciseDistributionScoreByTeam: FunctionComponent<Props> = ({
  exerciseId,
}) => {
  // Standard hooks
  const { t } = useFormatter();
  const theme: Theme = useTheme();

  // Fetching data
  const { injectExpectations, teams, teamsMap } = useHelper((helper: InjectHelper & TeamsHelper) => ({
    injectExpectations: helper.getExerciseInjectExpectations(exerciseId),
    teams: helper.getExerciseTeams(exerciseId),
    teamsMap: helper.getTeamsMap(),
  }));

  const teamsTotalScores = R.pipe(
    R.filter((n: InjectExpectation) => !R.isEmpty(n.inject_expectation_results) && n?.inject_expectation_team),
    R.groupBy(R.prop('inject_expectation_team')),
    R.toPairs,
    R.map((n: [string, InjectExpectationStore[]]) => ({
      ...teamsMap[n[0]],
      team_total_score: R.sum(
        R.map((o: InjectExpectationStore) => o.inject_expectation_score, n[1]),
      ),
    })),
  )(injectExpectations);

  const sortedTeamsByTotalScore = R.pipe(
    R.sortWith([R.descend(R.prop('team_total_score'))]),
    R.take(10),
  )(teamsTotalScores);

  const teamsColors = computeTeamsColors(teams, theme);
  const totalScoreByTeamData = [
    {
      name: t('Total score'),
      data: sortedTeamsByTotalScore.map((a: TeamStore & { team_total_score: number }) => ({
        x: a.team_name,
        y: a.team_total_score,
        fillColor: teamsColors[a.team_id],
      })),
    },
  ];

  return (
    <>
      {teamsTotalScores.length > 0 ? (
        <Chart
          options={horizontalBarsChartOptions(theme)}
          series={totalScoreByTeamData}
          type="bar"
          width="100%"
          height={50 + teamsTotalScores.length * 50}
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

export default ExerciseDistributionScoreByTeam;
