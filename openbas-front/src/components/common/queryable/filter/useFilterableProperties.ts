import filterableProperties from '../../../../actions/schema/schema-action';
import { convertJavaClassToJsonClass } from './FilterUtils';
import type { PropertySchemaDTO } from '../../../../utils/api-types';

const useFilterableProperties: (clazz: string, filterNames: string[]) => Promise<PropertySchemaDTO[]> = (clazz: string, filterNames: string[]) => {
  return filterableProperties(clazz, filterNames).then(((result: { data: PropertySchemaDTO[] }) => {
    const propertySchemas: PropertySchemaDTO[] = result.data;
    if (filterNames.some((s) => s.endsWith('_kill_chain_phases'))) {
      propertySchemas.push({
        schema_property_name: `${convertJavaClassToJsonClass(clazz)}_kill_chain_phases`,
        schema_property_type_array: true,
        schema_property_values: [],
        schema_property_has_dynamic_value: true,
      });
    }
    return propertySchemas;
  }));
};

export default useFilterableProperties;
