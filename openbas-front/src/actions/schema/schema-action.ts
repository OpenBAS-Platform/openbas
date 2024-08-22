import { simplePostCall } from '../../utils/Action';

const filterableProperties = (clazz: string, filterNames: string[] = []) => {
  const uri = `/api/schemas/${clazz}?filterableOnly=${true}`;
  return simplePostCall(uri, filterNames);
};

export default filterableProperties;
