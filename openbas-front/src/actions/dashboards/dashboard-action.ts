import { simpleCall } from '../../utils/Action';

export const DASHBOARD_URI = '/api/dashboards';

export const series = (widgetId: string) => {
  return simpleCall(`${DASHBOARD_URI}/series/${widgetId}`);
};
