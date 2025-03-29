import { type CSSProperties, type FunctionComponent, useEffect, useState } from 'react';

import FilterAutocomplete, { type OptionPropertySchema } from '../../../../../components/common/queryable/filter/FilterAutocomplete';
import FilterChips from '../../../../../components/common/queryable/filter/FilterChips';
import { type FilterHelpers } from '../../../../../components/common/queryable/filter/FilterHelpers';
import { type FilterGroup, type PropertySchemaDTO } from '../../../../../utils/api-types';

interface Props {
  filterGroup: FilterGroup;
  helpers: FilterHelpers;
  style: CSSProperties;
  contextId?: string;
}

const FilterFieldBaseEntity: FunctionComponent<Props> = ({
  filterGroup,
  helpers,
  style,
  contextId,
}) => {
  // Standard hooks
  const [pristine, setPristine] = useState(true);

  const [properties, setProperties] = useState<PropertySchemaDTO[]>([]);
  const [options, setOptions] = useState<OptionPropertySchema[]>([]);

  useEffect(() => {
    const newOptions = [{
      id: 'base_entity',
      label: 'Entity',
      operator: 'eq',
    } as OptionPropertySchema];
    const newPropertySchemas = [{
      schema_property_entity: 'base_entity',
      schema_property_has_dynamic_value: true,
      schema_property_label: 'Entity',
      schema_property_name: 'base_entity',
      schema_property_type: 'string',
      schema_property_type_array: true,
      schema_property_values: undefined,
    } as PropertySchemaDTO];
    setOptions(newOptions);
    setProperties(newPropertySchemas);
  }, []);

  return (
    <>
      <FilterAutocomplete
        filterGroup={filterGroup}
        helpers={helpers}
        options={options}
        setPristine={setPristine}
        style={style}
      />
      <FilterChips
        propertySchemas={properties}
        filterGroup={filterGroup}
        availableFilterNames={[]}
        helpers={helpers}
        pristine={pristine}
        contextId={contextId}
      />
    </>
  );
};

export default FilterFieldBaseEntity;
