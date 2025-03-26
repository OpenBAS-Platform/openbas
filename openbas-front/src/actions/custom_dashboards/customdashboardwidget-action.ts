import { simplePostCall } from '../../utils/Action';
import { type WidgetInput } from '../../utils/api-types';
import { CUSTOM_DASHBOARD_URI } from './customdashboard-action';

// eslint-disable-next-line import/prefer-default-export
export const createCustomDashboardWidget = (customDashboardId: string, input: WidgetInput) => {
  return simplePostCall(`${CUSTOM_DASHBOARD_URI}/${customDashboardId}/widgets`, input);
};
