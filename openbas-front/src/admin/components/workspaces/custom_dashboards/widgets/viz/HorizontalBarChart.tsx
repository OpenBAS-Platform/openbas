import { useTheme } from '@mui/material/styles';
import { type ApexOptions } from 'apexcharts';
import { type FunctionComponent } from 'react';
import Chart from 'react-apexcharts';

import { useFormatter } from '../../../../../../components/i18n';
import type { Widget } from '../../../../../../utils/api-types';
import { horizontalBarsChartOptions } from '../../../../../../utils/Charts';

interface Props {
  widgetMode: Widget['widget_config']['mode'];
  series: ApexOptions['series'];
}

const HorizontalBarChart: FunctionComponent<Props> = ({ widgetMode, series }) => {
  const theme = useTheme();
  const { t, fld } = useFormatter();

  return (
    <Chart
      options={horizontalBarsChartOptions(
        theme,
        false,
        widgetMode === 'temporal' ? fld : null,
        undefined,
        false,
        false,
        false,
        [],
        false,
        false,
        t('No data to display'),
      )}
      series={series}
      type="bar"
      width="100%"
      height="100%"
    />
  );
};

export default HorizontalBarChart;
