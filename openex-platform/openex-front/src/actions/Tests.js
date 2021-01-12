import * as schema from './Schema';
import { postReferential, getReferential } from '../utils/Action';

export const createExerciseTest = (data) => (dispatch) => postReferential(
  schema.testsCreateExercise,
  '/api/tests/create/exercise',
  data,
)(dispatch);

export const deleteUsersTest = () => (dispatch) => getReferential(
  schema.testsDeleteUsers,
  '/api/tests/delete/users',
)(dispatch);
