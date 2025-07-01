import { useTheme } from '@mui/material/styles';
import { type ApexOptions } from 'apexcharts';
import { type FunctionComponent } from 'react';
import Chart from 'react-apexcharts';

import { useFormatter } from '../../../../../../components/i18n';
import type { Widget } from '../../../../../../utils/api-types-custom';
import { verticalBarsChartOptions } from '../../../../../../utils/Charts';

interface Props {
  widgetConfig: Widget['widget_config'];
  series: ApexOptions['series'];
}

const VerticalBarChart: FunctionComponent<Props> = ({ widgetConfig, series }) => {
  const theme = useTheme();
  const { t, fld } = useFormatter();

  const widgetMode = (): 'structural' | 'temporal' => {
    if (widgetConfig.widget_configuration_type === 'temporal-histogram' || widgetConfig.widget_configuration_type === 'structural-histogram') {
      return widgetConfig.mode;
    }
    return 'structural';
  };

  return (
    <Chart
      options={verticalBarsChartOptions(
        theme,
        widgetMode() === 'temporal' ? fld : null,
        undefined,
        false,
        widgetMode() === 'temporal',
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
