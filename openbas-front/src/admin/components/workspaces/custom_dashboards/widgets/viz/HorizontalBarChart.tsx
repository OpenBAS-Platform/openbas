import { useTheme } from '@mui/material/styles';
import { type ApexOptions } from 'apexcharts';
import * as qs from 'qs';
import { type FunctionComponent, useContext } from 'react';
import Chart from 'react-apexcharts';
import { useLocation, useNavigate, useParams } from 'react-router';

import { buildFilter } from '../../../../../../components/common/queryable/filter/FilterUtils';
import { initSorting } from '../../../../../../components/common/queryable/Page';
import { useFormatter } from '../../../../../../components/i18n';
import { SIMULATION_BASE_URL } from '../../../../../../constants/BaseUrls';
import type { Exercise, SearchPaginationInput, Widget } from '../../../../../../utils/api-types';
import { horizontalBarsChartOptions } from '../../../../../../utils/Charts';
import { CustomDashboardContext } from '../../CustomDashboardContext';

interface Props {
  widgetConfig: Widget['widget_config'];
  series: ApexOptions['series'];
}

const HorizontalBarChart: FunctionComponent<Props> = ({ widgetConfig, series }) => {
  const theme = useTheme();
  const { t, fld } = useFormatter();
  const location = useLocation();
  const navigate = useNavigate();
  const { exerciseId } = useParams() as { exerciseId: Exercise['exercise_id'] };
  const { customDashboardParameters } = useContext(CustomDashboardContext);

  // On click enabled only if we are on a simulation + histogram + param field attack_patterns
  // + dimension inject expectations with dynamic simulation or simulation id from the actual simulation screen
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  function isBarClickable(config: any): boolean {
    return location.pathname.includes(SIMULATION_BASE_URL) && series && widgetConfig.widget_configuration_type === 'structural-histogram'
      && widgetConfig.field === 'base_attack_patterns_side'
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      && widgetConfig.series[config.seriesIndex].filter.filters.some((filter: any) => filter.key === 'base_entity' && filter.values.includes('expectation-inject')
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        && widgetConfig.series[config.seriesIndex].filter.filters.some((filter: any) => filter.key === 'base_simulation_side' && (filter.values.includes(exerciseId) || filter.values.find((value: any) => !!customDashboardParameters[value]))));
  }

  // TODO specific case to click on a bar chart and to be redirected => to make generic in the future
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  function onBarClickEvent(event: any, charContext: any, config: any) {
    if (isBarClickable(config)) {
      // Get attack pattern id from bar clicked and redirect to inject overview with filter for this attack pattern
      const initSearchPaginationInput: SearchPaginationInput = {
        page: 0,
        size: 20,
        sorts: initSorting('inject_updated_at', 'DESC'),
        filterGroup: {
          mode: 'or',
          filters: [
            // series[config.seriesIndex].data[config.dataPointIndex].meta => get attack pattern id from bar clicked
            // @ts-expect-error because data exists from series but is not an attribute of the type
            buildFilter('inject_attack_patterns', [series[config.seriesIndex].data[config.dataPointIndex].meta], 'contains'),
          ],
        },
      };
      const params = qs.stringify({
        ...initSearchPaginationInput,
        key: 'simulation-injects-results',
      }, { allowEmptyArrays: true });
      const encodedParams = btoa(params);
      // We do not use the traditional anchor (`#`) as the pagination hook overrides it
      navigate(location.pathname.split('/analysis')[0] + '?query=' + encodedParams + '&anchor=injects-results');
    }
  }

  // TODO specific case to show cursor on a bar you can click => to make generic in the future
  // Show cursor when we can click on a bar to be redirected
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  function onBarCursorEvent(event: any, charContext: any, config: any) {
    if (isBarClickable(config)) {
      event.target.style.cursor = 'pointer';
    }
  }

  const widgetMode = (): 'structural' | 'temporal' => {
    if (widgetConfig.widget_configuration_type === 'temporal-histogram' || widgetConfig.widget_configuration_type === 'structural-histogram') {
      return widgetConfig.mode;
    }
    return 'structural';
  };

  return (
    <Chart
      options={horizontalBarsChartOptions(
        theme,
        false,
        widgetMode() === 'temporal' ? fld : null,
        undefined,
        false,
        false,
        false,
        [],
        true,
        false,
        t('No data to display'),
        onBarClickEvent,
        onBarCursorEvent,
      )}
      series={series}
      type="bar"
      width="100%"
      height="100%"
    />
  );
};

export default HorizontalBarChart;
