import { simpleCall, simpleDelCall, simplePostCall, simplePutCall } from '../../utils/Action';
import type { CustomDashboardInput, CustomDashboardTimeFilterInput, SearchPaginationInput } from '../../utils/api-types';

export const CUSTOM_DASHBOARD_URI = '/api/custom-dashboards';

export const createCustomDashboard = (input: CustomDashboardInput) => {
  return simplePostCall(CUSTOM_DASHBOARD_URI, input);
};

export const customDashboards = () => {
  return simpleCall(CUSTOM_DASHBOARD_URI);
};

export const searchCustomDashboards = (searchPaginationInput: SearchPaginationInput) => {
  return simplePostCall(`${CUSTOM_DASHBOARD_URI}/search`, searchPaginationInput);
};

export const customDashboard = (id: string) => {
  return simpleCall(`${CUSTOM_DASHBOARD_URI}/${id}`);
};

export const updateCustomDashboard = (id: string, input: CustomDashboardInput) => {
  return simplePutCall(`${CUSTOM_DASHBOARD_URI}/${id}`, input);
};

export const updateCustomDashboardTimeRange = (id: string, input: CustomDashboardTimeFilterInput) => {
  return simplePutCall(`${CUSTOM_DASHBOARD_URI}/${id}/time`, input);
};

export const deleteCustomDashboard = (id: string) => {
  return simpleDelCall(`${CUSTOM_DASHBOARD_URI}/${id}`);
};
