import { simpleCall, simplePostCall } from '../../utils/Action';

export const filterableProperties = (clazz: string, filterNames: string[] = []) => {
  const uri = `/api/schemas/${clazz}?filterableOnly=${true}`;
  return simplePostCall(uri, filterNames);
};

export const engineSchemas = () => {
  const uri = `/api/engine/schemas`;
  return simpleCall(uri);
};
