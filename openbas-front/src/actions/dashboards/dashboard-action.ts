import { simplePostCall } from '../../utils/Action';

export const DASHBOARD_URI = '/api/dashboards';

export const series = (widgetId: string, parameters: Record<string, string | undefined>) => {
  return simplePostCall(`${DASHBOARD_URI}/series/${widgetId}`, parameters);
};

export const entities = (widgetId: string, parameters: Record<string, string | undefined>) => {
  return simplePostCall(`${DASHBOARD_URI}/entities/${widgetId}`, parameters);
};
