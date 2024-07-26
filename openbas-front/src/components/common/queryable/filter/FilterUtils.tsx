import React from 'react';
import * as R from 'ramda';
import type { Filter, FilterGroup, PropertySchemaDTO } from '../../../../utils/api-types';

export const emptyFilterGroup: FilterGroup = {
  mode: 'and',
  filters: [],
};

export const buildEmptyFilter = (key: string, operator: Filter['operator']) => {
  return {
    key,
    mode: 'and' as Filter['mode'],
    values: [],
    operator,
  };
};

export const buildFilter = (key: string, values: string[], operator: Filter['operator']) => {
  return {
    key,
    mode: 'and' as Filter['mode'],
    values,
    operator,
  };
};

export const isExistFilter = (filterGroup: FilterGroup, key: string) => {
  return filterGroup.filters?.some((f) => f.key === key);
};

export const isEmptyFilter = (filterGroup: FilterGroup, key: string) => {
  if (R.isEmpty(filterGroup.filters)) {
    return true;
  }
  return !filterGroup.filters?.find((f) => f.key === key) || R.isEmpty(filterGroup.filters?.find((f) => f.key === key)?.values);
};

// -- OPERATOR --

export const convertOperatorToIcon = (t: (text: string) => string, operator: Filter['operator']) => {
  switch (operator) {
    case 'eq':
      return <>&nbsp;=</>;
    case 'not_eq':
      return <>&nbsp;&#8800;</>;
    case 'not_contains':
      return t('not contains');
    case 'contains':
      return t('contains');
    case 'starts_with':
      return t('starts with');
    case 'not_starts_with':
      return t('not starts with');
    case 'empty':
      return t('is empty');
    case 'not_empty':
      return t('is not empty');
    default:
      return null;
  }
};

export const OperatorKeyValues: {
  [key: string]: string;
} = {
  eq: 'Equals',
  not_eq: 'Not equals',
  contains: 'Contains',
  not_contains: 'Not contains',
  starts_with: 'Starts with',
  not_starts_with: 'Not starts with',
  empty: 'Empty',
  not_empty: 'Not empty',
};

export const availableOperators = (propertySchema: PropertySchemaDTO) => {
  if (propertySchema.schema_property_values) {
    if (propertySchema.schema_property_type_array) {
      return ['contains', 'not_contains', 'empty', 'not_empty'];
    }
    return ['eq'];
  }
  if (propertySchema.schema_property_type_array) {
    return ['contains', 'not_contains', 'empty', 'not_empty'];
  }
  return [
    'eq',
    'not_eq',
    'contains',
    'not_contains',
    'starts_with',
    'not_starts_with',
  ];
};

export const convertJavaClassToJsonClass = (input: string) => {
  const converted = input.replace(/([A-Z])/g, '_$1').toLowerCase();
  return converted.startsWith('_') ? converted.slice(1) : converted;
};
