import { simplePostCall } from '../../utils/Action';
import { type SearchPaginationInput } from '../../utils/api-types';

const ROLES_URI = '/api/roles';
// eslint-disable-next-line import/prefer-default-export
export const searchRoles = ({ paginationInput }: { paginationInput: SearchPaginationInput }) => {
  const data = paginationInput;
  const uri = `${ROLES_URI}/search`;
  return simplePostCall(uri, data);
};
