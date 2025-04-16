import { useTheme } from '@mui/material/styles';
import { type ApexOptions } from 'apexcharts';
import { type FunctionComponent } from 'react';
import Chart from 'react-apexcharts';

import { useFormatter } from '../../../../../../components/i18n';
import { lineChartOptions } from '../../../../../../utils/Charts';

interface Props { series: ApexOptions['series'] }

const LineChart: FunctionComponent<Props> = ({ series }) => {
  const theme = useTheme();
  const { fld } = useFormatter();

  return (
    <Chart
      options={lineChartOptions(
        theme,
        true,
        fld,
        null,
        undefined,
        series ? series.length > 1 : false,
      )}
      series={series}
      type="line"
      width="100%"
      height="100%"
    />
  );
};

export default LineChart;
