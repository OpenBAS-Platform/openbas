import { memo, useEffect, useState } from 'react';

import { series } from '../../../../../actions/dashboards/dashboard-action';
import { useFormatter } from '../../../../../components/i18n';
import Loader from '../../../../../components/Loader';
import { type EsSeries } from '../../../../../utils/api-types';
import { type Widget } from '../../../../../utils/api-types-custom';
import DonutChart from './viz/DonutChart';
import HorizontalBarChart from './viz/HorizontalBarChart';
import LineChart from './viz/LineChart';
import SecurityCoverage from './viz/SecurityCoverage';
import VerticalBarChart from './viz/VerticalBarChart';
import { getWidgetTitle } from './WidgetUtils';

interface WidgetTemporalVizProps {
  widget: Widget;
  fullscreen: boolean;
  setFullscreen: (fullscreen: boolean) => void;
}

const WidgetViz = ({ widget, fullscreen, setFullscreen }: WidgetTemporalVizProps) => {
  const { t } = useFormatter();
  const [vizData, setVizData] = useState<EsSeries[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    series(widget.widget_id).then((response) => {
      if (response.data) {
        setVizData(response.data);
      }
    }).finally(() => setLoading(false));
  }, [widget]);

  if (loading) {
    return <Loader variant="inElement" />;
  }

  const seriesData = vizData.map(({ label, data }) => {
    if (data) {
      return ({
        name: label,
        data: data.map(n => ({
          x: n.label,
          y: n.value,
        })),
      });
    }
    return { data: [] };
  });

  switch (widget.widget_type) {
    case 'security-coverage':
      return (
        <SecurityCoverage
          widgetId={widget.widget_id}
          widgetTitle={getWidgetTitle(widget.widget_config.title, widget.widget_type, t)}
          fullscreen={fullscreen}
          setFullscreen={setFullscreen}
          data={vizData}
        />
      );
    case 'vertical-barchart':
      return (
        <VerticalBarChart
          widgetMode={widget.widget_config.mode}
          series={seriesData}
        />
      );
    case 'horizontal-barchart':
      return (
        <HorizontalBarChart
          series={seriesData}
        />
      );
    case 'line':
      return <LineChart series={seriesData} />;
    case 'donut': {
      // The seriesLimit is set to 1 for the donut.
      const data = seriesData[0].data;
      return (
        <DonutChart
          labels={data.map(s => s?.x || t('-'))}
          series={data.map(s => s?.y || 0)}
        />
      );
    }
    default:
      return 'Not implemented yet';
  }
};

export default memo(WidgetViz);
