import { simplePostCall } from '../utils/Action';

const globalSearch = (searchTerm: string | null) => {
  const uri = '/api/globalsearch';
  return simplePostCall(uri, { searchTerm });
};

export default globalSearch;
