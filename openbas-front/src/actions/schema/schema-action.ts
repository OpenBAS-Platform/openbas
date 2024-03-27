import { simpleCall } from '../../utils/Action';

const filterableProperties = (clazz: string) => {
  const uri = `/api/schemas/${clazz}?filterableOnly=${true}`;
  return simpleCall(uri);
};

export default filterableProperties;
