import Chart from 'react-apexcharts';
import React, { FunctionComponent } from 'react';
import * as R from 'ramda';
import { useTheme } from '@mui/styles';
import { colors, horizontalBarsChartOptions } from '../../../utils/Charts';
import Empty from '../../../components/Empty';
import type { TeamStore } from '../persons/teams/Team';
import { useFormatter } from '../../../components/i18n';
import type { Theme } from '../../../components/Theme';

interface Props {
  teams: TeamStore[];
}

const InjectsDistribution: FunctionComponent<Props> = ({
  teams,
}) => {
  // Standard hooks
  const { t } = useFormatter();
  const theme = useTheme<Theme>();

  const mapIndexed = R.addIndex(R.map);
  const teamsColors = R.pipe(
    mapIndexed((a: TeamStore, index: number) => [
      a.team_id,
      colors(theme.palette.mode === 'dark' ? 400 : 600)[index],
    ]),
    R.fromPairs,
  )(teams);

  const topTeams = R.pipe(
    R.sortWith([R.descend(R.prop('team_injects_number'))]),
    R.take(6),
  )(teams || []);
  const distributionChartData = [
    {
      name: t('Number of injects'),
      data: topTeams.map((a: TeamStore) => ({
        x: a.team_name,
        y: a.team_injects_number,
        fillColor: teamsColors[a.team_id],
      })),
    },
  ];
  const maxInjectsNumber = Math.max(
    ...topTeams.map((a: TeamStore) => a.team_injects_number),
  );

  return (
    <>
      {topTeams.length > 0 ? (
        <Chart
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          // Need to migrate Chart Charts.js file to TSX
          options={horizontalBarsChartOptions(
            theme,
            maxInjectsNumber < 2,
          )}
          series={distributionChartData}
          type="bar"
          width="100%"
          height={50 + topTeams.length * 50}
        />
      ) : (
        <Empty message={t('No teams in this exercise.')} />
      )}
    </>
  );
};

export default InjectsDistribution;
