import { simpleCall } from '../../utils/Action';
import { SIMULATION_URI } from './simulation-action';

export const customDashboardForSimulation = (simulationId: string, customDashboardId: string) => {
  return simpleCall(`${SIMULATION_URI}/${simulationId}/custom-dashboards/${customDashboardId}`);
};

export const seriesForSimulation = (simulationId: string, widgetId: string) => {
  return simpleCall(`${SIMULATION_URI}/${simulationId}/series/${widgetId}`);
};
