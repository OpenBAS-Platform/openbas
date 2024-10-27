import { useTheme } from '@mui/styles';
import { FunctionComponent } from 'react';
import Chart from 'react-apexcharts';
import * as R from 'ramda';
import { Theme } from '@mui/material';
import Empty from '../../../../../components/Empty';
import type { ExerciseStore } from '../../../../../actions/exercises/Exercise';
import { useFormatter } from '../../../../../components/i18n';
import { useAppDispatch } from '../../../../../utils/hooks';
import { useHelper } from '../../../../../store';
import useDataLoader from '../../../../../utils/hooks/useDataLoader';
import type { Communication } from '../../../../../utils/api-types';
import { lineChartOptions } from '../../../../../utils/Charts';
import { getTeamsColors } from '../../../common/injects/InjectsDistribution';
import type { TeamsHelper } from '../../../../../actions/teams/team-helper';
import { fetchExerciseTeams } from '../../../../../actions/Exercise';
import type { TeamStore } from '../../../../../actions/teams/Team';

interface Props {
  exerciseId: ExerciseStore['exercise_id'];
}

const MailDistributionOverTime: FunctionComponent<Props> = ({
  exerciseId,
}) => {
  // Standard hooks
  const { t, nsdt } = useFormatter();
  const dispatch = useAppDispatch();
  const theme: Theme = useTheme();

  // Fetching data
  const { teams } = useHelper((helper: TeamsHelper) => ({
    teams: helper.getExerciseTeams(exerciseId),
  }));
  useDataLoader(() => {
    dispatch(fetchExerciseTeams(exerciseId));
  });

  let cumulation = 0;
  const teamsColors = getTeamsColors(teams);
  const teamsCommunications = R.pipe(
    R.map((n: TeamStore) => {
      cumulation = 0;
      return R.assoc(
        'team_communications',
        R.pipe(
          R.sortWith([R.ascend(R.prop('communication_received_at'))]),
          R.map((i: Communication) => {
            cumulation += 1;
            return R.assoc('communication_cumulated_number', cumulation, i);
          }),
        )(n.team_communications),
        n,
      );
    }),
    R.map((a: TeamStore & { team_communications: Array<Communication & { communication_cumulated_number: number }> }) => ({
      name: a.team_name,
      color: teamsColors[a.team_id],
      data: a.team_communications?.map((c: Communication & { communication_cumulated_number: number }) => ({
        x: c.communication_received_at,
        y: c.communication_cumulated_number,
      })),
    })),
  )(teams);

  return (
    <>
      {teamsCommunications.length > 0 ? (
        <Chart
          // @ts-expect-error: Need to migrate Chart.js file
          options={lineChartOptions(
            theme,
            true,
            // @ts-expect-error: Need to migrate i18n.js file
            nsdt,
            null,
            undefined,
            false,
          )}
          series={teamsCommunications}
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

export default MailDistributionOverTime;
