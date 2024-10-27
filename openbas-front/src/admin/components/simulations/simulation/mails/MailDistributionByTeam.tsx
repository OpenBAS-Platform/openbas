import { useTheme } from '@mui/styles';
import { FunctionComponent } from 'react';
import Chart from 'react-apexcharts';
import * as R from 'ramda';
import Empty from '../../../../../components/Empty';
import type { ExerciseStore } from '../../../../../actions/exercises/Exercise';
import { useFormatter } from '../../../../../components/i18n';
import { useAppDispatch } from '../../../../../utils/hooks';
import { useHelper } from '../../../../../store';
import useDataLoader from '../../../../../utils/hooks/useDataLoader';
import { horizontalBarsChartOptions } from '../../../../../utils/Charts';
import { computeTeamsColors } from '../overview/DistributionUtils';
import type { TeamsHelper } from '../../../../../actions/teams/team-helper';
import { fetchExerciseTeams } from '../../../../../actions/Exercise';
import type { Theme } from '../../../../../components/Theme';
import type { Team } from '../../../../../utils/api-types';

interface Props {
  exerciseId: ExerciseStore['exercise_id'];
}

const MailDistributionByTeam: FunctionComponent<Props> = ({
  exerciseId,
}) => {
  // Standard hooks
  const { t } = useFormatter();
  const dispatch = useAppDispatch();
  const theme: Theme = useTheme();

  // Fetching data
  const { teams } = useHelper((helper: TeamsHelper) => ({
    teams: helper.getTeams(),
  }));
  useDataLoader(() => {
    dispatch(fetchExerciseTeams(exerciseId));
  });

  const teamsColors = computeTeamsColors(teams, theme);
  const sortedTeamsByCommunicationNumber = R.pipe(
    R.map((a: Team) => R.assoc(
      'team_communications_number',
      a.team_communications?.length,
      a,
    )),
    R.sortWith([R.descend(R.prop('team_communications_number'))]),
    R.take(10),
  )(teams || []);
  const totalMailsByTeamData = [
    {
      name: t('Total mails'),
      data: sortedTeamsByCommunicationNumber.map((a: Team & { team_communications_number: number }) => ({
        x: a.team_name,
        y: a.team_communications_number,
        fillColor: teamsColors[a.team_id],
      })),
    },
  ];

  return (
    <>
      {sortedTeamsByCommunicationNumber.length > 0 ? (
        <Chart
          // @ts-expect-error: Need to migrate Chart.js file
          options={horizontalBarsChartOptions(theme)}
          series={totalMailsByTeamData}
          type="bar"
          width="100%"
          height={50 + sortedTeamsByCommunicationNumber.length * 50}
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

export default MailDistributionByTeam;
