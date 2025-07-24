import { simplePostCall } from '../../utils/Action';

export const DASHBOARD_URI = '/api/dashboards';

export const count = (widgetId: string, parameters: Record<string, string | undefined>) => {
  return simplePostCall(`${DASHBOARD_URI}/count/${widgetId}`, parameters);
};

export const series = (widgetId: string, parameters: Record<string, string | undefined>) => {
  return simplePostCall(`${DASHBOARD_URI}/series/${widgetId}`, parameters);
};

export const entities = (widgetId: string, parameters: Record<string, string | undefined>) => {
  return simplePostCall(`${DASHBOARD_URI}/entities/${widgetId}`, parameters);
};

export const attackPaths = (widgetId: string, parameters: Record<string, string | undefined>) => {
  return simplePostCall(`${DASHBOARD_URI}/attack-paths/${widgetId}`, parameters);
};
