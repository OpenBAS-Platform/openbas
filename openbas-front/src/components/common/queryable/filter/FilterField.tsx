import React, { CSSProperties, FunctionComponent, useEffect, useState } from 'react';
import { availableOperators } from './FilterUtils';
import { useFormatter } from '../../../i18n';
import type { FilterGroup, PropertySchemaDTO } from '../../../../utils/api-types';
import FilterChips from './FilterChips';
import useFilterableProperties from './useFilterableProperties';
import { FilterHelpers } from './FilterHelpers';
import FilterAutocomplete, { OptionPropertySchema } from './FilterAutocomplete';

interface Props {
  entityPrefix: string;
  availableFilterNames?: string[];
  filterGroup: FilterGroup;
  helpers: FilterHelpers;
  style: CSSProperties;
}

const FilterField: FunctionComponent<Props> = ({
  entityPrefix,
  availableFilterNames = [],
  filterGroup,
  helpers,
  style,
}) => {
  // Standard hooks
  const { t } = useFormatter();
  const [pristine, setPristine] = useState(true);

  const [properties, setProperties] = useState<PropertySchemaDTO[]>([]);
  const [options, setOptions] = useState<OptionPropertySchema[]>([]);

  useEffect(() => {
    useFilterableProperties(entityPrefix, availableFilterNames).then((propertySchemas: PropertySchemaDTO[]) => {
      const newOptions = propertySchemas.map((property) => (
        { id: property.schema_property_name, label: t(property.schema_property_name), operator: availableOperators(property)[0] } as OptionPropertySchema
      ));
      setOptions(newOptions);
      setProperties(propertySchemas);
    });
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
        availableFilterNames={availableFilterNames}
        helpers={helpers}
        pristine={pristine}
      />
    </>
  );
};

export default FilterField;
