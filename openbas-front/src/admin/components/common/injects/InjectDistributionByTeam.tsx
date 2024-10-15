import { useTheme } from '@mui/styles';
import React, { FunctionComponent } from 'react';
import Chart from 'react-apexcharts';
import * as R from 'ramda';
import Empty from '../../../../components/Empty';
import type { ExerciseStore } from '../../../../actions/exercises/Exercise';
import { useFormatter } from '../../../../components/i18n';
import { useAppDispatch } from '../../../../utils/hooks';
import { useHelper } from '../../../../store';
import useDataLoader from '../../../../utils/hooks/useDataLoader';
import { horizontalBarsChartOptions } from '../../../../utils/Charts';
import type { Theme } from '../../../../components/Theme';
import { getTeamsColors } from './InjectsDistribution';
import type { TeamsHelper } from '../../../../actions/teams/team-helper';
import { fetchExerciseTeams } from '../../../../actions/Exercise';
import type { TeamStore } from '../../../../actions/teams/Team';

interface Props {
  exerciseId: ExerciseStore['exercise_id'];
}

const InjectDistributionByTeam: FunctionComponent<Props> = ({
  exerciseId,
}) => {
  // Standard hooks
  const { t } = useFormatter();
  const dispatch = useAppDispatch();
  const theme: Theme = useTheme();

  // Fetching data
  const { teams } = useHelper((helper: TeamsHelper) => ({
    teams: helper.getExerciseTeams(exerciseId),
  }));
  useDataLoader(() => {
    dispatch(fetchExerciseTeams(exerciseId));
  });

  const teamsColors = getTeamsColors(teams);
  const sortedTeamsByExpectedScore = R.pipe(
    R.sortWith([
      R.descend(R.prop('team_injects_expectations_total_expected_score')),
    ]),
    R.take(10),
  )(teams || []);
  const expectedScoreByTeamData = [
    {
      name: t('Total expected score'),
      data: sortedTeamsByExpectedScore.map((a: TeamStore) => ({
        x: a.team_name,
        y: a.team_injects_expectations_total_expected_score,
        fillColor: teamsColors[a.team_id],
      })),
    },
  ];

  return (
    <>
      {sortedTeamsByExpectedScore.length > 0 ? (
        <Chart
          options={horizontalBarsChartOptions(theme)}
          series={expectedScoreByTeamData}
          type="bar"
          width="100%"
          height={50 + sortedTeamsByExpectedScore.length * 50}
        />
      ) : (
        <Empty message={t('No teams in this exercise.')} />
      )}
    </>
  );
};

export default InjectDistributionByTeam;
