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

export const countBySimulation = (simulationId: string, widgetId: string, parameters: Record<string, string | undefined>) => {
  return simplePostCall(`/api/exercises/${simulationId}/dashboard/count/${widgetId}`, parameters);
};

export const seriesBySimulation = (simulationId: string, widgetId: string, parameters: Record<string, string | undefined>) => {
  return simplePostCall(`/api/exercises/${simulationId}/dashboard/series/${widgetId}`, parameters);
};

export const entitiesBySimulation = (simulationId: string, widgetId: string, parameters: Record<string, string | undefined>) => {
  return simplePostCall(`/api/exercises/${simulationId}/dashboard/entities/${widgetId}`, parameters);
};

export const attackPathsBySimulation = (simulationId: string, widgetId: string, parameters: Record<string, string | undefined>) => {
  return simplePostCall(`/api/exercises/${simulationId}/dashboard/attack-paths/${widgetId}`, parameters);
};
