import * as schema from './Schema';
// eslint-disable-next-line import/no-cycle
import { getReferential } from '../utils/Action';

// eslint-disable-next-line import/prefer-default-export
export const fetchOrganizations = () => (dispatch) => getReferential(
  schema.arrayOfOrganizations,
  '/api/organizations',
)(dispatch);
