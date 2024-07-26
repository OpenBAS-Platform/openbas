import React, { CSSProperties, FunctionComponent, useEffect, useState } from 'react';
import { Autocomplete as MuiAutocomplete, IconButton, TextField, Tooltip } from '@mui/material';
import { FilterListOffOutlined } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import { availableOperators, buildEmptyFilter } from './FilterUtils';
import { useFormatter } from '../../../i18n';
import type { Filter, FilterGroup, PropertySchemaDTO } from '../../../../utils/api-types';
import FilterChips from './FilterChips';
import useFilterableProperties from './useFilterableProperties';
import { Option } from '../../../../utils/Option';
import { FilterHelpers } from './FilterHelpers';

const useStyles = makeStyles(() => ({
  container: {
    display: 'flex',
    gap: 10,
  },
}));

type OptionPropertySchema = Option & { operator: Filter['operator'] };

interface Props {
  clazz: string;
  availableFilterNames?: string[];
  filterGroup: FilterGroup;
  helpers: FilterHelpers;
  style: CSSProperties;
}

const FilterField: FunctionComponent<Props> = ({
  clazz,
  availableFilterNames = [],
  filterGroup,
  helpers,
  style,
}) => {
  // Standard hooks
  const classes = useStyles();
  const { t } = useFormatter();
  const [pristine, setPristine] = useState(true);

  const [properties, setProperties] = useState<PropertySchemaDTO[]>([]);
  const [options, setOptions] = useState<OptionPropertySchema[]>([]);
  const [inputValue, setInputValue] = React.useState('');

  useEffect(() => {
    useFilterableProperties(clazz, availableFilterNames).then((propertySchemas: PropertySchemaDTO[]) => {
      const newOptions = propertySchemas.map((property) => (
        { id: property.schema_property_name, label: t(property.schema_property_name), operator: availableOperators(property)[0] } as OptionPropertySchema
      ));
      setOptions(newOptions);
      setProperties(propertySchemas);
    });
  }, []);

  const handleChange = (value: string, operator: Filter['operator']) => {
    setPristine(false);
    helpers.handleAddFilterWithEmptyValue(buildEmptyFilter(value, operator));
  };
  const handleClearFilters = () => {
    setPristine(false);
    helpers.handleClearAllFilters();
  };

  const computeOptions = () => {
    return options.filter((o) => !filterGroup.filters?.map((f) => f.key).includes(o.id));
  };

  return (
    <>
      <div className={classes.container}>
        <MuiAutocomplete
          options={computeOptions()}
          sx={{ width: 200 }}
          value={null}
          onChange={(_, selectOptionValue) => {
            if (selectOptionValue) {
              handleChange(selectOptionValue.id, selectOptionValue.operator);
            }
          }}
          inputValue={inputValue}
          onInputChange={(_, newValue, reason) => {
            if (reason === 'reset') {
              return;
            }
            setInputValue(newValue);
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="outlined"
              size="small"
              label={t('Add filter')}
              style={style}
            />
          )}
          renderOption={(props, option) => <li {...props}>{option.label}</li>}
        />
        <Tooltip title={t('Clear filters')}>
          <IconButton
            style={{ ...style, maxHeight: 40 }}
            color="primary"
            onClick={handleClearFilters}
            size="small"
          >
            <FilterListOffOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
      </div>
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
