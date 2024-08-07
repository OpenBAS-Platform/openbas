import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { Chip, Tooltip } from '@mui/material';
import { FilterHelpers } from './FilterHelpers';
import FilterChipPopover from './FilterChipPopover';
import type { Filter, PropertySchemaDTO } from '../../../../utils/api-types';
import { convertOperatorToIcon } from './FilterUtils';
import { useFormatter } from '../../../i18n';
import useRetrieveOptions from './useRetrieveOptions';

interface Props {
  filter: Filter;
  helpers: FilterHelpers;
  propertySchema: PropertySchemaDTO;
  pristine: boolean;
}

const FilterChip: FunctionComponent<Props> = ({
  filter,
  helpers,
  propertySchema,
  pristine,
}) => {
  // Standard hooks
  const { t } = useFormatter();

  const chipRef = useRef<HTMLAnchorElement>(null);
  const [open, setOpen] = useState(!pristine);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleRemoveFilter = () => {
    if (helpers) {
      helpers.handleRemoveFilterByKey(filter.key);
    }
  };

  const { options, searchOptions } = useRetrieveOptions();

  useEffect(() => {
    if (filter.values) {
      searchOptions(filter.key, filter.values);
    }
  }, [filter]);

  const title = () => {
    return (
      <><strong>{t(filter.key)}</strong> {convertOperatorToIcon(t, filter.operator)} {options.map((o) => o.label).join(', ')}</>
    );
  };

  return (
    <>
      <Tooltip
        title={title()}
      >
        <Chip
          label={title()}
          onClick={handleOpen}
          onDelete={handleRemoveFilter}
          component="a"
          ref={chipRef}
        />
      </Tooltip>
      {chipRef?.current
        && <FilterChipPopover
          filter={filter}
          helpers={helpers}
          open={open}
          onClose={handleClose}
          anchorEl={chipRef.current}
          propertySchema={propertySchema}
           />
      }
    </>
  );
};
export default FilterChip;
