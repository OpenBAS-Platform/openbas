import { useTheme } from '@mui/material/styles';
import { memo, useEffect, useState } from 'react';
import Chart from 'react-apexcharts';

import { series } from '../../../../../actions/dashboards/dashboard-action';
import { useFormatter } from '../../../../../components/i18n';
import Loader from '../../../../../components/Loader';
import { type EsSeries, type Widget } from '../../../../../utils/api-types';
import { lineChartOptions, verticalBarsChartOptions } from '../../../../../utils/Charts';
import { isEmptyField, isNotEmptyField } from '../../../../../utils/utils';
import MatrixMitre from './viz/MatrixMitre';

interface WidgetStructuralVizProps { widget: Widget }

const WidgetStructuralViz = ({ widget }: WidgetStructuralVizProps) => {
  const [structuralVizData, setStructuralVizData] = useState<EsSeries[]>([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const { t } = useFormatter();

  useEffect(() => {
    series(widget.widget_id).then((response) => {
      if (response.data && isNotEmptyField(response.data)) {
        setStructuralVizData(response.data);
        setLoading(false);
      } else if (response.data && isEmptyField(response.data.at(0))) {
        setLoading(false);
      }
    });
  }, [widget]);

  if (loading) {
    return <Loader variant="inElement" />;
  }

  const seriesData
      = structuralVizData.map(({ label, data, color }) => {
        if (data) {
          return ({
            label,
            data: data.map(n => ({
              x: n.label,
              y: n.value,
            })),
          });
        }
        return [];
      });

  console.log(structuralVizData, seriesData);

  switch (widget.widget_type) {
    case 'security-coverage':
      return (
        <MatrixMitre widgetTitle={!widget.widget_config.title ? 'Your widget' : widget.widget_config.title} data={structuralVizData} />
      );
    case 'vertical-barchart':
      return (
        <Chart
          options={verticalBarsChartOptions(
            theme,
            null,
            undefined,
            false,
            false,
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
    case 'line':
      return (
        <Chart
          options={lineChartOptions(
            theme,
            false,
            null,
            null,
            undefined,
            false,
          )}
          series={seriesData}
          type="line"
          width="100%"
          height="100%"
        />
      );
    default:
      return 'Not implemented yet';
  }
};

export default memo(WidgetStructuralViz);
