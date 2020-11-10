import * as schema from './Schema'
import {getReferential} from '../utils/Action'

export const fetchOrganizations = () => (dispatch) => {
    return getReferential(schema.arrayOfOrganizations, '/api/organizations')(dispatch)
}