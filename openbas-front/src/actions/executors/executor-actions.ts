import { simpleCall, simplePostCall } from '../../utils/Action';

export const EXECUTOR_URI = '/api/executors';

export const searchExecutorAsOption = (searchText: string = '') => {
  const params = { searchText };
  return simpleCall(`${EXECUTOR_URI}/options`, params);
};

export const searchExecutorByIdAsOption = (ids: string[]) => {
  return simplePostCall(`${EXECUTOR_URI}/options`, ids);
};
