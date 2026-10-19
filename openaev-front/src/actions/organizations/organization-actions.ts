import { simpleCall, simplePostCall } from '../../utils/Action';
import type { SearchPaginationInput } from '../../utils/api-types';

const ORGANIZATION_URI = '/api/organizations';

export const fetchOrganization = (organizationId: string, notifyError: boolean = true) => {
  return simpleCall(`${ORGANIZATION_URI}/${organizationId}`, undefined, notifyError);
};

export const searchOrganizations = (paginationInput: SearchPaginationInput, notifyError: boolean = true) => {
  const data = paginationInput;
  const uri = `${ORGANIZATION_URI}/search`;
  return simplePostCall(uri, data, undefined, notifyError);
};

// "Injects played" for the organization detail page: every inject (atomic testing or simulation
// inject) that concerns the organization through its teams - targeted directly or evidenced by
// the table-top expectations persisted at execution time. Resolved server-side.
export const searchInjectsForOrganization = (organizationId: string, searchPaginationInput: SearchPaginationInput, notifyError: boolean = true) => {
  return simplePostCall(`${ORGANIZATION_URI}/${organizationId}/injects/search`, searchPaginationInput, undefined, notifyError);
};

export const searchOrganizationsByNameAsOption = (searchText: string = '') => {
  const params = { searchText };
  return simpleCall(`${ORGANIZATION_URI}/options`, { params });
};

export const searchOrganizationByIdAsOptions = (ids: string[]) => {
  return simplePostCall(`${ORGANIZATION_URI}/options`, ids);
};
