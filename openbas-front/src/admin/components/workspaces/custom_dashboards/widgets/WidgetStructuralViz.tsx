import React, { memo } from 'react';
import Chart from 'react-apexcharts';

import { type Widget } from '../../../../../utils/api-types';
import { verticalBarsChartOptions } from '../../../../../utils/Charts';
import { useRemoveIdAndIncorrectKeysFromFilterGroupObject } from '../../../../utils/filters/filtersUtils';
import { computerRelativeDate, dayStartDate, formatDate } from '../../../../utils/Time';

interface WidgetTemporalVizProps { widget: Widget }

const WidgetTemporalViz = ({ widget }: WidgetTemporalVizProps) => {
  const dataSelection = widget.dataSelection.map(data => ({
    ...data,
    filters: useRemoveIdAndIncorrectKeysFromFilterGroupObject(data.filters, mainEntityTypes),
    dynamicFrom: useRemoveIdAndIncorrectKeysFromFilterGroupObject(data.dynamicFrom, ['Stix-Core-Object']),
    dynamicTo: useRemoveIdAndIncorrectKeysFromFilterGroupObject(data.dynamicTo, ['Stix-Core-Object']),
  }));

  switch (widget.type) {
    case 'vertical-bar-chart':
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
            !exercisesCountByWeekHasValues,
            undefined,
            t('No data to display'),
          )}
          series={exercisesCountByWeek}
          type="bar"
          width="100%"
          height="100%"
        />
      );
    default:
      return 'Not implemented yet';
  }
};

export default memo(DashboardEntitiesViz);
