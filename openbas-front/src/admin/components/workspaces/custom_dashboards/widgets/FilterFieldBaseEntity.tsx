import { Card, CardActionArea, CardContent, Checkbox, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { type FunctionComponent, useEffect, useState } from 'react';

import { engineSchemas } from '../../../../../actions/schema/schema-action';
import FilterAutocomplete, { type OptionPropertySchema } from '../../../../../components/common/queryable/filter/FilterAutocomplete';
import FilterChips from '../../../../../components/common/queryable/filter/FilterChips';
import { availableOperators } from '../../../../../components/common/queryable/filter/FilterUtils';
import useFilterableProperties from '../../../../../components/common/queryable/filter/useFilterableProperties';
import { buildSearchPagination } from '../../../../../components/common/queryable/QueryableUtils';
import { useQueryable } from '../../../../../components/common/queryable/useQueryableWithLocalStorage';
import { useFormatter } from '../../../../../components/i18n';
import Loader from '../../../../../components/Loader';
import { type PropertySchemaDTO } from '../../../../../utils/api-types';
import { type Option } from '../../../../../utils/Option';
import { MITRE_FILTER_KEY } from '../../../common/filters/MitreFilter';

interface Props {
  value: string | null;
  onChange: (value: string | null) => void;
}

const ENTITIES = ['InjectExpectation', 'finding'];

const FilterFieldBaseEntity: FunctionComponent<Props> = ({
  value,
  onChange,
}) => {
  // Standard hooks
  const { t } = useFormatter();
  const theme = useTheme();

  const [loading, setLoading] = useState<boolean>(true);
  const [entityOptions, setEntityOptions] = useState<Option[]>([]);

  useEffect(() => {
    engineSchemas().then((response: { data: PropertySchemaDTO[] }) => {
      const entities = Array.from(new Set(
        response.data.map(d => d.schema_property_entity),
      )).filter(e => ENTITIES.includes(e));
      setEntityOptions(entities.map(entity => ({
        id: entity,
        label: t(entity),
      })));
      setLoading(false);
    });
  }, []);

  const handleOnChange = (v: string) => {
    if (v === value) {
      onChange(null);
    } else {
      onChange(v);
    }
  };

  // Filters
  const { queryableHelpers, searchPaginationInput } = useQueryable(buildSearchPagination({}));

  const [properties, setProperties] = useState<PropertySchemaDTO[]>([]);
  const [propertyOptions, setPropertyOptions] = useState<OptionPropertySchema[]>([]);
  const [pristine, setPristine] = useState(true);
  useEffect(() => {
    if (value) {
      useFilterableProperties(value, []).then((propertySchemas: PropertySchemaDTO[]) => {
        const newOptions = propertySchemas.filter(property => property.schema_property_name !== MITRE_FILTER_KEY)
          .map(property => (
            {
              id: property.schema_property_name,
              label: t(property.schema_property_label),
              operator: availableOperators(property)[0],
            } as OptionPropertySchema
          ))
          .sort((a, b) => a.label.localeCompare(b.label));
        setPropertyOptions(newOptions);
        setProperties(propertySchemas);
      });
    }
  }, [value]);

  if (loading) {
    return <Loader variant="inElement" />;
  }

  return (
    <div style={{
      display: 'grid',
      gap: `${theme.spacing(1)}`,
      gridTemplateRows: '1fr 1fr',
    }}
    >
      <div style={{
        display: 'grid',
        gap: `${theme.spacing(1)}`,
        gridTemplateColumns: '1fr 1fr',
      }}
      >
        {entityOptions.map(option => (
          <Card
            key={option.id}
            variant="outlined"
          >
            <CardActionArea onClick={() => handleOnChange(option.id)}>
              <CardContent sx={{
                p: 0,
                display: 'grid',
                gridTemplateColumns: '50px 1fr',
                alignItems: 'center',
              }}
              >
                <Checkbox checked={value === option.id} />
                <Typography style={{ textAlign: 'center' }}>
                  {t(option.label)}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </div>
      <FilterAutocomplete
        filterGroup={searchPaginationInput.filterGroup}
        helpers={queryableHelpers.filterHelpers}
        options={propertyOptions}
        setPristine={setPristine}
      />
      <FilterChips
        propertySchemas={properties}
        filterGroup={searchPaginationInput.filterGroup}
        helpers={queryableHelpers.filterHelpers}
        pristine={pristine}
      />
    </div>
  );
};

export default FilterFieldBaseEntity;
