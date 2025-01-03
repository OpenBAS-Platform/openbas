import { useTheme } from '@mui/styles';
import { FunctionComponent } from 'react';
import Chart from 'react-apexcharts';

import Empty from '../../../../components/Empty';
import { useFormatter } from '../../../../components/i18n';
import type { Theme } from '../../../../components/Theme';
import type { Team } from '../../../../utils/api-types';
import { horizontalBarsChartOptions } from '../../../../utils/Charts';

interface Props {
  topTeams: Team[];
  distributionChartData: ApexAxisChartSeries;
  maxInjectsNumber: number;
}

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
