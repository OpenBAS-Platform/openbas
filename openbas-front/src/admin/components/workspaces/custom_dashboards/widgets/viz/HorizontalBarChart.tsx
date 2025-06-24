import { useTheme } from '@mui/material/styles';
import { type ApexOptions } from 'apexcharts';
import { type FunctionComponent } from 'react';
import Chart from 'react-apexcharts';

import { horizontalBarsChartOptions } from '../../../../../../utils/Charts';

interface Props { series: ApexOptions['series'] }

const HorizontalBarChart: FunctionComponent<Props> = ({ series }) => {
  const theme = useTheme();
  // const { t, fld } = useFormatter();

  return (
    <Chart
      options={horizontalBarsChartOptions(
        theme,
        true,
        null,
        null,
        false,
        false,
        false,
        null,
        true,
      )}
      series={series}
      type="bar"
      width="100%"
      height="100%"
    />
  );
};

export default HorizontalBarChart;
