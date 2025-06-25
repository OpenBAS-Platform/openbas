import { simpleCall, simplePutCall } from '../../utils/Action';
import { type DashboardParametersInput } from '../../utils/api-types';

export const DASHBOARD_URI = '/api/dashboards';

export const series = (widgetId: string) => {
  return simpleCall(`${DASHBOARD_URI}/series/${widgetId}`);
};

export const getParameters = () => {
  return simpleCall(`${DASHBOARD_URI}/parameters`);
};

export const updateParameters = (customDashboardApi: string, input: DashboardParametersInput) => {
  return simplePutCall(`${DASHBOARD_URI}/parameters/${customDashboardApi}`, input);
};
