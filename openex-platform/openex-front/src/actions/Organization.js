import * as schema from './Schema';
// eslint-disable-next-line import/no-cycle
import { getReferential } from '../utils/Action';

export const fetchOrganizations = () => (dispatch) => getReferential(
  schema.arrayOfOrganizations,
  '/api/organizations',
)(dispatch);
