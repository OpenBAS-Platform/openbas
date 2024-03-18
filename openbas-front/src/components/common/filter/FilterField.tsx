import React, { CSSProperties, FunctionComponent, useEffect, useState } from 'react';
import { Autocomplete as MuiAutocomplete, IconButton, TextField, Tooltip } from '@mui/material';
import { FilterListOffOutlined } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import { buildEmptyFilter, emptyFilterGroup } from './FilterUtils';
import { useFormatter } from '../../i18n';
import useFiltersState from './useFiltersState';
import type { FilterGroup, PropertySchemaDTO } from '../../../utils/api-types';
import FilterChips from './FilterChips';
import useFilterableProperties from '../../../utils/hooks/useFilterableProperties';
import { Option } from '../../../utils/Option';

const useStyles = makeStyles(() => ({
  container: {
    display: 'flex',
    gap: 10,
  },
}));

interface Props {
  labelId: string;
  clazz: string;
  initialValue?: FilterGroup;
  onChange: (value: FilterGroup) => void;
  style: CSSProperties;
}

const FilterField: FunctionComponent<Props> = ({
  labelId,
  clazz,
  initialValue,
  onChange,
  style,
}) => {
  // Standard hooks
  const classes = useStyles();
  const { t } = useFormatter();

  const [filterGroup, helpers] = useFiltersState(initialValue ?? emptyFilterGroup, onChange);

  const [properties, setProperties] = useState<PropertySchemaDTO[]>([]);
  const [options, setOptions] = useState<Option[]>([]);
  const [inputValue, setInputValue] = React.useState('');

  useEffect(() => {
    useFilterableProperties(clazz).then((result: { data: PropertySchemaDTO[] }) => {
      const propertySchemas: PropertySchemaDTO[] = result.data;
      setProperties(propertySchemas);
      setOptions(propertySchemas.map((property) => (
        { id: property.schema_property_name, label: t(property.schema_property_name) } as Option
      )));
    });
  }, []);

  const handleChange = (value: string) => {
    helpers.handleAddFilterWithEmptyValue(buildEmptyFilter(value));
  };
  const handleClearFilters = () => {
    helpers.handleClearAllFilters();
  };

  const computeOptions = () => {
    return options.filter((o) => !filterGroup.filters?.map((f) => f.key).includes(o.id));
  };

  return (
    <>
      <div className={classes.container}>
        <MuiAutocomplete
          // @ts-expect-error: labelId
          labelId={labelId}
          options={computeOptions()}
          sx={{ width: 200 }}
          value={null}
          onChange={(_, selectOptionValue) => {
            if (selectOptionValue) {
              handleChange(selectOptionValue.id);
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
      <FilterChips propertySchemas={properties} filterGroup={filterGroup} helpers={helpers} />
    </>
  );
};

export default FilterField;
