import { TableChart } from '@mui/icons-material';
import { AlignHorizontalLeft, ChartBar, ChartDonut, ChartLine } from 'mdi-material-ui';

import { type Filter, type FilterGroup, type InjectExpectation, type StructuralHistogramSeries } from '../../../../../utils/api-types';
import { type HistogramWidget, type Widget, type WidgetInput } from '../../../../../utils/api-types-custom';

export type WidgetInputWithoutLayout = Omit<WidgetInput, 'widget_layout'>;
export type StepType = ('type' | 'series' | 'parameters');
export const steps: StepType[] = ['type', 'series', 'parameters'];
export const lastStepIndex = steps.length - 1;
const defaultSteps: StepType[] = ['type', 'series', 'parameters'];
const defaultModes: HistogramWidget['mode'][] = ['structural', 'temporal'];

export const widgetVisualizationTypes: {
  category: Widget['widget_type'];
  seriesLimit: number;
  modes?: HistogramWidget['mode'][];
  fields?: string[];
  steps?: StepType[];
}[] = [
  {
    category: 'security-coverage',
    seriesLimit: 2,
    modes: ['structural'],
    fields: ['base_attack_patterns_side'],
  },
  {
    category: 'vertical-barchart',
    seriesLimit: 5,
  },
  {
    category: 'horizontal-barchart',
    seriesLimit: 2,
    modes: ['structural'],
  },
  {
    category: 'line',
    modes: ['temporal'],
    seriesLimit: 5,
  },
  {
    category: 'donut',
    modes: ['structural'],
    seriesLimit: 1,
  },
];

export const renderWidgetIcon = (type: Widget['widget_type'], fontSize: 'large' | 'small' | 'medium') => {
  switch (type) {
    case 'vertical-barchart':
      return <ChartBar fontSize={fontSize} color="primary" />;
    case 'horizontal-barchart':
      return <AlignHorizontalLeft fontSize={fontSize} color="primary" />;
    case 'line':
      return <ChartLine fontSize={fontSize} color="primary" />;
    case 'donut':
      return <ChartDonut fontSize={fontSize} color="primary" />;
    case 'security-coverage':
      return <TableChart fontSize={fontSize} color="primary" />;
    default:
      return <div />;
  }
};

export const getCurrentSeriesLimit = (type: Widget['widget_type']) => {
  return widgetVisualizationTypes.find(widget => widget.category === type)?.seriesLimit ?? 0;
};

export const getAvailableModes = (type: Widget['widget_type']) => {
  return widgetVisualizationTypes.find(widget => widget.category === type)?.modes ?? defaultModes;
};

export const getAvailableSteps = (type: Widget['widget_type']) => {
  return widgetVisualizationTypes.find(widget => widget.category === type)?.steps ?? defaultSteps;
};

export const getAvailableFields = (type: Widget['widget_type']) => {
  return widgetVisualizationTypes.find(widget => widget.category === type)?.fields ?? null;
};

export const getWidgetTitle = (widgetTitle: Widget['widget_config']['title'], type: Widget['widget_type'], t: (key: string) => string) => {
  if (type === 'security-coverage') {
    return !widgetTitle ? t('Security Coverage') : widgetTitle;
  }
  return widgetTitle || '';
};

// -- FILTERS --

export const BASE_ENTITY_FILTER_KEY = 'base_entity';
export const getBaseEntities = (filterGroup: FilterGroup | undefined) => {
  return filterGroup?.filters?.filter(f => f.key === BASE_ENTITY_FILTER_KEY).map(f => f.values ?? []).flat();
};
export const excludeBaseEntities = (filterGroup: FilterGroup | undefined) => {
  if (!filterGroup) {
    return undefined;
  }
  return {
    mode: filterGroup.mode,
    filters: filterGroup.filters?.filter(f => f.key !== BASE_ENTITY_FILTER_KEY) ?? [],
  };
};

// -- MATRIX MITRE --
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
