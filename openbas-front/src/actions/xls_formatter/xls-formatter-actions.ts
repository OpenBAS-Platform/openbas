import type { SearchPaginationInput } from '../../utils/api-types';
import { simplePostCall } from '../../utils/Action';

const XLS_FORMATTER_URI = '/api/mappers';

export const searchMappers = (searchPaginationInput: SearchPaginationInput) => {
  const data = searchPaginationInput;
  const uri = `${XLS_FORMATTER_URI}/search`;
  return simplePostCall(uri, data);
};
