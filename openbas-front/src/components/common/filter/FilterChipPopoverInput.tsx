import { MenuItem, Select, TextField } from '@mui/material';
import React, { FunctionComponent } from 'react';
import { useFormatter } from '../../i18n';
import type { Filter, PropertySchemaDTO } from '../../../utils/api-types';
import { FilterHelpers } from './FilterHelpers';

interface Props {
  filter: Filter;
  helpers: FilterHelpers;
}

export const BasicTextInput: FunctionComponent<Props> = ({
  filter,
  helpers,
}) => {
  // Standard hooks
  const { t } = useFormatter();

  return (
    <TextField
      variant="outlined"
      size="small"
      fullWidth
      label={t(filter.key)}
      defaultValue={filter.values?.[0] ?? ''}
      autoFocus
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          helpers.handleAddSingleValueFilter(
            filter.key,
            (event.target as HTMLInputElement).value,
          );
        }
      }}
      onBlur={(event) => {
        helpers.handleAddSingleValueFilter(
          filter.key,
          (event.target as HTMLInputElement).value,
        );
      }}
    />
  );
};

export const BasicSelectInput: FunctionComponent<Props & { propertySchema: PropertySchemaDTO }> = ({
  filter,
  helpers,
  propertySchema,
}) => {
  return (
    <Select
      variant="outlined"
      size="small"
      fullWidth
      multiple
      value={filter.values || []}
      autoFocus
      onChange={(event) => {
        if (Array.isArray(event.target.value)) {
          helpers.handleAddMultipleValueFilter(
            filter.key,
            event.target.value,
          );
        }
      }}
    >
      {propertySchema.schema_property_values?.map((property) => {
        return (<MenuItem key={property} value={property}>{property}</MenuItem>);
      })}
    </Select>
  );
};

export const FilterChipPopoverInput: FunctionComponent<Props & { propertySchema: PropertySchemaDTO }> = ({
  propertySchema,
  filter,
  helpers,
}) => {
  const choice = () => {
    if (propertySchema.schema_property_values) {
      return (<BasicSelectInput propertySchema={propertySchema} filter={filter} helpers={helpers} />);
    }
    return (<BasicTextInput filter={filter} helpers={helpers} />);
  };
  return (choice());
};
