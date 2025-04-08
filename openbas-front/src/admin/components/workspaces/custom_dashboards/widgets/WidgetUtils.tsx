import { FilterNone } from '@mui/icons-material';
import { ChartBar } from 'mdi-material-ui';

import { type Filter, type HistogramWidget, type InjectExpectation, type StructuralHistogramSeries, type Widget } from '../../../../../utils/api-types';

export type StepType = ('Visualization' | 'Perspective' | 'Filters' | 'Parameters');

export const widgetVisualizationTypes: {
  name: string;
  category: Widget['widget_type'];
  seriesLimit: number;
  modes: HistogramWidget['mode'][];
  fields?: string[];
  steps: StepType[];
}[] = [
  // {
  //   name: 'Vertical Bar',
  //   category: 'vertical-barchart',
  //   seriesLimit: 5,
  //   modes: ['structural', 'temporal'],
  //   steps: ['Visualization', 'Filters', 'Parameters'],
  // },
  {
    name: 'Matrix mitre',
    category: 'security-coverage',
    seriesLimit: 2,
    modes: ['structural'],
    fields: ['base_attack_patterns_side'],
    steps: ['Visualization', 'Perspective', 'Filters', 'Parameters'],
  },
];

export const renderWidgetIcon = (type: Widget['widget_type'], fontSize: 'large' | 'small' | 'medium') => {
  switch (type) {
    case 'vertical-barchart':
      return <ChartBar fontSize={fontSize} color="primary" />;
    case 'security-coverage':
      return <FilterNone fontSize={fontSize} color="primary" />;
    default:
      return <div />;
  }
};

export const getCurrentSeriesLimit = (type: Widget['widget_type']) => {
  return widgetVisualizationTypes.find(widget => widget.category === type)?.seriesLimit ?? 0;
};

export const getAvailableModes = (type: Widget['widget_type']) => {
  return widgetVisualizationTypes.find(widget => widget.category === type)?.modes ?? [];
};

export const getAvailableSteps = (type: Widget['widget_type']) => {
  return widgetVisualizationTypes.find(widget => widget.category === type)?.steps ?? [];
};

export const getAvailableFields = (type: Widget['widget_type']) => {
  return widgetVisualizationTypes.find(widget => widget.category === type)?.fields ?? [];
};

// -- MATRIX MITRE --

export const BASE_ENTITY_FILTER_KEY = 'base_entity';
const entityFilter: Filter = {
  key: BASE_ENTITY_FILTER_KEY,
  mode: 'and',
  operator: 'eq',
  values: ['expectation-inject'],
};
const statusSuccessFilter: Filter = {
  key: 'inject_expectation_status',
  mode: 'and',
  operator: 'eq',
  values: ['SUCCESS'],
};
const statusFailedFilter: Filter = {
  key: 'inject_expectation_status',
  mode: 'and',
  operator: 'eq',
  values: ['FAILED'],
};
const typeFilter: (injectExpectationType: InjectExpectation['inject_expectation_type']) => Filter = injectExpectationType => ({
  key: 'inject_expectation_type',
  mode: 'and',
  operator: 'eq',
  values: [injectExpectationType],
});

const getSuccessSeries: (injectExpectationType: InjectExpectation['inject_expectation_type']) => StructuralHistogramSeries = (injectExpectationType) => {
  return {
    filter: {
      mode: 'and',
      filters: [
        entityFilter,
        statusSuccessFilter,
        typeFilter(injectExpectationType),
      ],
    },
    name: 'SUCCESS',
  };
};

const getFailedSeries: (injectExpectationType: InjectExpectation['inject_expectation_type']) => StructuralHistogramSeries = (injectExpectationType) => {
  return {
    filter: {
      mode: 'and',
      filters: [
        entityFilter,
        statusFailedFilter,
        typeFilter(injectExpectationType),
      ],
    },
    name: 'FAILED',
  };
};

export const getSeries: (injectExpectationType: InjectExpectation['inject_expectation_type']) => StructuralHistogramSeries[] = (injectExpectationType) => {
  return [getSuccessSeries(injectExpectationType), getFailedSeries(injectExpectationType)];
};
