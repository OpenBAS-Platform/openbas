import { simplePostCall } from '../../utils/Action';

export const DASHBOARD_URI = '/api/dashboards';

export const series = (widgetId: string, parameters: Map<string, string | undefined>) => {
  return simplePostCall(`${DASHBOARD_URI}/series/${widgetId}`, Object.fromEntries(parameters));
};

export const entities = (widgetId: string, parameters: Map<string, string | undefined>) => {
  return simplePostCall(`${DASHBOARD_URI}/entities/${widgetId}`, Object.fromEntries(parameters));
};
