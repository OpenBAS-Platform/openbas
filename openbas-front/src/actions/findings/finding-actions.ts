import { simplePostCall } from '../../utils/Action';
import { type SearchPaginationInput } from '../../utils/api-types';

const FINDING_URI = '/api/findings';

// eslint-disable-next-line import/prefer-default-export
export const searchFindings = (searchPaginationInput: SearchPaginationInput) => {
  const data = searchPaginationInput;
  const uri = `${FINDING_URI}/search`;
  return simplePostCall(uri, data);
};

export const searchFindingsForInjects = (injectId: string, searchPaginationInput: SearchPaginationInput) => {
  const data = searchPaginationInput;
  const uri = `${FINDING_URI}/injects/${injectId}/search`;
  return simplePostCall(uri, data);
};
