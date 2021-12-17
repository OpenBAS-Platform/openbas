import * as schema from './Schema';
import { getReferential } from '../utils/Action';

// eslint-disable-next-line import/prefer-default-export
export const fetchOrganizations = () => (dispatch) => getReferential(schema.arrayOfOrganizations, '/api/organizations')(dispatch);
