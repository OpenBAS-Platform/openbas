import Chart from 'react-apexcharts';
import { FunctionComponent } from 'react';
import * as R from 'ramda';
import { useTheme } from '@mui/styles';
import { colors, horizontalBarsChartOptions } from '../../../../utils/Charts';
import Empty from '../../../../components/Empty';
import { useFormatter } from '../../../../components/i18n';
import type { Theme } from '../../../../components/Theme';
import type { TeamStore } from '../../../../actions/teams/Team';

interface Props {
  topTeams: TeamStore[];
  distributionChartData: ApexAxisChartSeries;
  maxInjectsNumber: number;
}

export const getTeamsColors: (teams: TeamStore[]) => Record<string, string> = (teams: TeamStore[]) => {
  const theme = useTheme<Theme>();

  const mapIndexed = R.addIndex(R.map);
  return R.pipe(
    mapIndexed((a: TeamStore, index: number) => [
      a.team_id,
      colors(theme.palette.mode === 'dark' ? 400 : 600)[index],
    ]),
    R.fromPairs,
  )(teams);
};

const InjectsDistribution: FunctionComponent<Props> = ({
  topTeams,
  distributionChartData,
  maxInjectsNumber,
}) => {
  // Standard hooks
  const { t } = useFormatter();
  const theme = useTheme<Theme>();

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
        <Empty message={t('No teams.')} />
      )}
    </>
  );
};

export default InjectsDistribution;
