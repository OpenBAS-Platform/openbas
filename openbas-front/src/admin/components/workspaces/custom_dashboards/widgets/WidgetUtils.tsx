import { ChartBar } from 'mdi-material-ui';

import { type Widget } from '../../../../../utils/api-types';

export const widgetVisualizationTypes: [{
  name: string;
  category: Widget['widget_type'];
  dataSelectionsLimit: number;
}] = [
  {
    name: 'Vertical Bar',
    category: 'vertical-barchart',
    dataSelectionsLimit: 5,
  },
];

export const renderWidgetIcon = (type: Widget['widget_type'], fontSize: 'large' | 'small' | 'medium') => {
  switch (type) {
    case 'vertical-barchart':
      return <ChartBar fontSize={fontSize} color="primary" />;
    default:
      return <div />;
  }
};

export const getCurrentDataSelectionsLimit = (type: Widget['widget_type']) => {
  return widgetVisualizationTypes.find(widget => widget.category === type)?.dataSelectionsLimit ?? 0;
};
