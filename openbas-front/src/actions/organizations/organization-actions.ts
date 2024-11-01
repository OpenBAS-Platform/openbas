import { simpleCall, simplePostCall } from '../../utils/Action';

const ORGANIZATION_URI = '/api/organizations';

export const searchOrganizationsByNameAsOption = (searchText: string = '') => {
  const params = { searchText };
  return simpleCall(`${ORGANIZATION_URI}/options`, params);
};

export const searchOrganizationByIdAsOptions = (ids: string[]) => {
  return simplePostCall(`${ORGANIZATION_URI}/options`, ids);
};
