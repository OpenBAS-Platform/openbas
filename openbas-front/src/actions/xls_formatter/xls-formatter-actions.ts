import { Dispatch } from 'redux';
import { MapperAddInput, SearchPaginationInput } from '../../utils/api-types';
import { postReferential, simplePostCall } from '../../utils/Action';
import { mapper } from './xls-formatter-schema';

const XLS_FORMATTER_URI = '/api/mappers';

export const searchMappers = (searchPaginationInput: SearchPaginationInput) => {
  const data = searchPaginationInput;
  const uri = `${XLS_FORMATTER_URI}/search`;
  return simplePostCall(uri, data);
};

export const addMapper = (data: MapperAddInput) => (dispatch: Dispatch) => {
  return postReferential(mapper, XLS_FORMATTER_URI, data)(dispatch);
};
