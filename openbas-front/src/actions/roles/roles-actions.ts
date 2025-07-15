import type { Dispatch } from 'redux';

import { delReferential, simplePostCall } from '../../utils/Action';
import { type Role, type SearchPaginationInput } from '../../utils/api-types';

const ROLES_URI = '/api/roles';
export const searchRoles = (paginationInput: SearchPaginationInput) => {
  const data = paginationInput;
  const uri = `${ROLES_URI}/search`;
  return simplePostCall(uri, data);
};

export const deleteRoles = (roleId: Role['role_id']) => (dispatch: Dispatch) => {
  const uri = `${ROLES_URI}/${roleId}`;
  return delReferential(uri, 'roles', roleId)(dispatch);
};
