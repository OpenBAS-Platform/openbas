import { useTheme } from '@mui/material/styles';
import { type ApexOptions } from 'apexcharts';
import { type FunctionComponent } from 'react';
import Chart from 'react-apexcharts';

import { donutChartOptions } from '../../../../../../utils/Charts';

interface Props {
  series: ApexOptions['series'];
  labels: string[];
}

const DonutChart: FunctionComponent<Props> = ({ series, labels }) => {
  const theme = useTheme();

  return (
    <Chart
      options={donutChartOptions({
        theme,
        labels: labels,
      })}
      series={series}
      type="donut"
      width="100%"
      height="100%"
    />
  );
};

export default DonutChart;
