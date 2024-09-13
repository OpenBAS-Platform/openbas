import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { Chip, Tooltip } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { FilterHelpers } from './FilterHelpers';
import FilterChipPopover from './FilterChipPopover';
import type { Filter, PropertySchemaDTO } from '../../../../utils/api-types';
import { convertOperatorToIcon } from './FilterUtils';
import { useFormatter } from '../../../i18n';
import useRetrieveOptions from './useRetrieveOptions';
import { Option } from '../../../../utils/Option';
import type { Theme } from '../../../Theme';

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    display: 'flex',
    alignItems: 'center',
    lineHeight: '32px',
    cursor: 'pointer',
    '&:hover': { textDecorationLine: 'underline' },
  },
  mode: {
    display: 'inline-block',
    height: '100%',
    backgroundColor: theme.palette.action?.selected,
    padding: '0 4px',
  },
  empty: {
    backgroundColor: 'transparent',
    borderColor: 'white',
  },
}));

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
  const { t, fldt } = useFormatter();
  const classes = useStyles();

  const chipRef = useRef<HTMLDivElement>(null);
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

  const toValues = (opts: Option[]) => {
    return opts.map((o, idx) => {
      let or = <></>;
      if (idx > 0) {
        or = <div className={classes.mode}> {t('OR')} </div>;
      }
      if (propertySchema.schema_property_type.includes('instant')) {
        return (
          <span key={o.id}>{or} {fldt(o.label)}</span>
        );
      }
      return (<span key={o.id}>{or} {o.label}</span>);
    });
  };

  const title = (isTooltip: boolean) => {
    if (isTooltip) {
      return (<span><strong>{t(filter.key)}</strong>{' '}<span>{convertOperatorToIcon(t, filter.operator)} {toValues(options)}</span></span>);
    }
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span onClick={handleOpen} className={classes.container}>
          <strong>{t(filter.key)}</strong>
          {convertOperatorToIcon(t, filter.operator)}
        </span>
        <>&nbsp;</>
        {toValues(options)}
      </div>
    );
  };

  const chipVariant = (!filter.values || filter.values.length === 0) && !['nil', 'not_nil'].includes(filter.operator ?? 'eq')
    ? 'outlined'
    : 'filled';

  return (
    <>
      <Tooltip
        title={title(true)}
      >
        <Chip
          variant={chipVariant}
          label={title(false)}
          onDelete={handleRemoveFilter}
          component="div"
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
