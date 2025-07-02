import { memo, useContext, useEffect, useState } from 'react';

import { entities, series } from '../../../../../actions/dashboards/dashboard-action';
import { useFormatter } from '../../../../../components/i18n';
import Loader from '../../../../../components/Loader';
import { type EsBase, type EsSeries } from '../../../../../utils/api-types';
import { type Widget } from '../../../../../utils/api-types-custom';
import { CustomDashboardContext } from '../CustomDashboardContext';
import DonutChart from './viz/DonutChart';
import HorizontalBarChart from './viz/HorizontalBarChart';
import LineChart from './viz/LineChart';
import List from './viz/list/List';
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
  const [seriesVizData, setSeriesVizData] = useState<EsSeries[]>([]);
  const [entitiesVizData, setEntitiesVizData] = useState<EsBase[]>([]);
  const [loading, setLoading] = useState(true);

  const { customDashboardParameters } = useContext(CustomDashboardContext);
  useEffect(() => {
    switch (widget.widget_type) {
      case 'list':
        entities(widget.widget_id, customDashboardParameters).then((response) => {
          if (response.data) {
            setEntitiesVizData(response.data);
          }
        }).finally(() => setLoading(false));
        break;
      default:
        series(widget.widget_id, customDashboardParameters).then((response) => {
          if (response.data) {
            setSeriesVizData(response.data);
          }
        }).finally(() => setLoading(false));
    }
  }, [widget, customDashboardParameters]);

  if (loading) {
    return <Loader variant="inElement" />;
  }

  const seriesData = seriesVizData.map(({ label, data }) => {
    if (data) {
      return ({
        name: label,
        data: data.map(n => ({
          x: n.label,
          y: n.value,
          meta: n.key,
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
          data={seriesVizData}
        />
      );
    case 'vertical-barchart':
      return (
        <VerticalBarChart
          widgetConfig={widget.widget_config}
          series={seriesData}
        />
      );
    case 'horizontal-barchart':
      return (
        <HorizontalBarChart
          widgetConfig={widget.widget_config}
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
    case 'list':
      return (<List elements={entitiesVizData} config={widget.widget_config} />);
    default:
      return 'Not implemented yet';
  }
};

export default memo(WidgetViz);
