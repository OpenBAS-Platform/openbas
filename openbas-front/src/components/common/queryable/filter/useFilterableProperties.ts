import filterableProperties from '../../../../actions/schema/schema-action';
import { convertJsonClassToJavaClass } from './FilterUtils';
import type { PropertySchemaDTO } from '../../../../utils/api-types';

const useFilterableProperties: (entityPrefix: string, filterNames: string[]) => Promise<PropertySchemaDTO[]> = (entity_prefix: string, filterNames: string[]) => {
  const javaClass = convertJsonClassToJavaClass(entity_prefix);
  return filterableProperties(javaClass, filterNames).then(((result: { data: PropertySchemaDTO[] }) => {
    const propertySchemas: PropertySchemaDTO[] = result.data;
    if (filterNames.some((s) => s.endsWith('_kill_chain_phases'))) {
      propertySchemas.push({
        schema_property_name: `${entity_prefix}_kill_chain_phases`,
        schema_property_type_array: true,
        schema_property_values: [],
        schema_property_has_dynamic_value: true,
      });
    }
    return propertySchemas;
  }));
};

export default useFilterableProperties;
