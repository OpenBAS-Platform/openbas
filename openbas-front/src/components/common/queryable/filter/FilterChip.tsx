import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { Box, Chip, Tooltip } from '@mui/material';
import { makeStyles } from '@mui/styles';
import * as R from 'ramda';
import classNames from 'classnames';
import { FilterHelpers } from './FilterHelpers';
import FilterChipPopover from './FilterChipPopover';
import type { Filter, PropertySchemaDTO } from '../../../../utils/api-types';
import { convertOperatorToIcon } from './FilterUtils';
import { useFormatter } from '../../../i18n';
import useRetrieveOptions from './useRetrieveOptions';
import { Option } from '../../../../utils/Option';
import type { Theme } from '../../../Theme';

const useStyles = makeStyles((theme: Theme) => ({
  mode: {
    display: 'inline-block',
    height: '100%',
    backgroundColor: theme.palette.action?.selected,
    margin: '0 4px',
    padding: '0 4px',
  },
  modeTooltip: {
    margin: '0 4px',
  },
  container: {
    gap: '4px',
    display: 'flex',
    overflow: 'hidden',
    maxWidth: '400px',
    alignItems: 'center',
    lineHeight: '32px',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  label: {
    cursor: 'pointer',
    '&:hover': {
      textDecorationLine: 'underline',
    },
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

  const toValues = (opts: Option[], isTooltip: boolean) => {
    return opts.map((o, idx) => {
      let or = <></>;
      if (idx > 0) {
        or = <div className={classNames({
          [classes.mode]: !isTooltip,
          [classes.modeTooltip]: isTooltip,
        })}
             >
          {t('OR')}
        </div>;
      }
      if (propertySchema.schema_property_type.includes('instant')) {
        return (
          <>{or}<span key={o.id}> {fldt(o.label)}</span></>
        );
      }
      return (<>{or}<span key={o.id}> {o.label}</span></>);
    });
  };

  const filterValues = (isTooltip: boolean) => {
    const operator = filter.operator ?? 'eq';
    const isOperatorNil = ['empty', 'not_empty'].includes(operator);
    if (isOperatorNil) {
      return (
        <>
          <strong
            className={classes.label}
            onClick={handleOpen}
          >
            {t(filter.key)}
          </strong>{' '}
          <span>
            {operator === 'empty' ? t('is empty') : t('is not empty')}
          </span>
        </>
      );
    }
    return (
      <span className={classes.container}>
        <strong className={classes.label} onClick={handleOpen}>
          {t(filter.key)}
          {convertOperatorToIcon(t, filter.operator)}
        </strong>
        {' '}
        <Box sx={{ display: 'flex', flexDirection: 'row', overflow: 'hidden' }}>
          {toValues(options, isTooltip)}
        </Box>
      </span>
    );
  };

  const isEmpty = (values?: string[]) => {
    return R.isEmpty(values) || values?.some((v) => R.isEmpty(v));
  };

  const chipVariant = isEmpty(filter.values) && !['empty', 'not_empty'].includes(filter.operator ?? 'eq')
    ? 'outlined'
    : 'filled';

  return (
    <>
      <Tooltip
        title={filterValues(true)}
      >
        <Chip
          variant={chipVariant}
          label={filterValues(false)}
          onDelete={handleRemoveFilter}
          sx={{ borderRadius: 1 }}
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
