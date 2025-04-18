import { simplePostCall } from '../../utils/Action';
import type { SearchPaginationInput } from '../../utils/api-types';

const searchTargets = (injectId: string, targetType: string, searchPaginationInput: SearchPaginationInput) => {
  const data = searchPaginationInput;
  const uri = `/api/injects/${injectId}/targets/${targetType}/search`;
  return simplePostCall(uri, data);
};

export default searchTargets;
