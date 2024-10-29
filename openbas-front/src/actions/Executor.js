import { getReferential, simplePostCall } from '../utils/Action';
import * as schema from './Schema';

export const fetchExecutors = () => (dispatch) => {
  const uri = '/api/executors';
  return getReferential(schema.arrayOfExecutors, uri)(dispatch);
};

export const fetchExecutor = executorId => (dispatch) => {
  const uri = `/api/executors/${executorId}`;
  return getReferential(schema.executor, uri)(dispatch);
};

export const searchExecutors = (paginationInput) => {
  const data = paginationInput;
  const uri = '/api/executors/search';
  return simplePostCall(uri, data);
};
