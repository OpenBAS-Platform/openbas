import { ChartBar } from 'mdi-material-ui';

import { type Widget } from '../../../../../utils/api-types';
import { FilterNone } from '@mui/icons-material';

export const widgetVisualizationTypes: {
  name: string;
  category: Widget['widget_type'];
  seriesLimit: number;
}[] = [
  {
    name: 'Vertical Bar',
    category: 'vertical-barchart',
    seriesLimit: 5,
  },
  {
    name: 'Matrix mitre',
    category: 'matrix-mitre',
    seriesLimit: 2,
  },
];

export const renderWidgetIcon = (type: Widget['widget_type'], fontSize: 'large' | 'small' | 'medium') => {
  switch (type) {
    case 'vertical-barchart':
      return <ChartBar fontSize={fontSize} color="primary" />;
    case 'matrix-mitre':
      return <FilterNone fontSize={fontSize} color="primary" />;
    default:
      return <div />;
  }
};

export const getCurrentSeriesLimit = (type: Widget['widget_type']) => {
  return widgetVisualizationTypes.find(widget => widget.category === type)?.seriesLimit ?? 0;
};
