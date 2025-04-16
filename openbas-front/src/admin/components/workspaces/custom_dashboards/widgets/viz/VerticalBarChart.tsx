import { useTheme } from '@mui/material/styles';
import { type ApexOptions } from 'apexcharts';
import { type FunctionComponent } from 'react';
import Chart from 'react-apexcharts';

import { useFormatter } from '../../../../../../components/i18n';
import type { Widget } from '../../../../../../utils/api-types';
import { verticalBarsChartOptions } from '../../../../../../utils/Charts';

interface Props {
  widgetMode: Widget['widget_config']['mode'];
  series: ApexOptions['series'];
}

const VerticalBarChart: FunctionComponent<Props> = ({ widgetMode, series }) => {
  const theme = useTheme();
  const { t, fld } = useFormatter();

  return (
    <Chart
      options={verticalBarsChartOptions(
        theme,
        widgetMode === 'temporal' ? fld : null,
        undefined,
        false,
        widgetMode === 'temporal',
        false,
        true,
        'dataPoints',
        true,
        false,
        undefined,
        t('No data to display'),
      )}
      series={series}
      type="bar"
      width="100%"
      height="100%"
    />
  );
};

export default VerticalBarChart;
