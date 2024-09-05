import filterableProperties from '../../../../actions/schema/schema-action';
import { convertJsonClassToJavaClass } from './FilterUtils';
import type { PropertySchemaDTO } from '../../../../utils/api-types';

const useFilterableProperties: (entityPrefix: string, filterNames: string[]) => Promise<PropertySchemaDTO[]> = (entity_prefix: string, filterNames: string[]) => {
  if (filterNames.length === 0) {
    return Promise.resolve([]);
  }
  const javaClass = convertJsonClassToJavaClass(entity_prefix);
  return filterableProperties(javaClass, filterNames).then(((result: { data: PropertySchemaDTO[] }) => {
    return result.data;
  }));
};

export default useFilterableProperties;
