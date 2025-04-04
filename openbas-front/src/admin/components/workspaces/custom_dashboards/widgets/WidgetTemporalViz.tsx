import { useTheme } from '@mui/material/styles';
import { memo, useEffect, useState } from 'react';
import Chart from 'react-apexcharts';

import { series } from '../../../../../actions/dashboards/dashboard-action';
import { useFormatter } from '../../../../../components/i18n';
import Loader from '../../../../../components/Loader';
import { type EsSeriesData, type Widget } from '../../../../../utils/api-types';
import { verticalBarsChartOptions } from '../../../../../utils/Charts';
import { isEmptyField, isNotEmptyField } from '../../../../../utils/utils';

interface WidgetTemporalVizProps { widget: Widget }

const WidgetTemporalViz = ({ widget }: WidgetTemporalVizProps) => {
  const theme = useTheme();
  const { t, fld } = useFormatter();
  const [temporalVizData, setTemporalVizData] = useState<EsSeriesData[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    series(widget.widget_id).then((response) => {
      if (response.data && isNotEmptyField(response.data.at(0)) && isNotEmptyField(response.data.at(0).data)) {
        setTemporalVizData(response.data.at(0).data);
        setLoading(false);
      } else if (response.data && isNotEmptyField(response.data.at(0)) && isEmptyField(response.data.at(0).data)) {
        setLoading(false);
      }
    });
  }, [widget]);

  if (loading) {
    return <Loader variant="inElement" />;
  }
  const seriesData = [
    {
      name: widget.widget_config.title,
      data: temporalVizData.map(n => ({
        x: n.label,
        y: n.value,
      })),
    },
  ];
  switch (widget.widget_type) {
    case 'vertical-barchart':
      return (
        <Chart
          options={verticalBarsChartOptions(
            theme,
            fld,
            undefined,
            false,
            true,
            false,
            true,
            'dataPoints',
            true,
            false,
            undefined,
            t('No data to display'),
          )}
          series={seriesData}
          type="bar"
          width="100%"
          height="100%"
        />
      );
    default:
      return 'Not implemented yet';
  }
};

export default memo(WidgetTemporalViz);
