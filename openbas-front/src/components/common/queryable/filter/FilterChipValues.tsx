import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import classNames from 'classnames';
import { FunctionComponent, useEffect } from 'react';

import type { Filter, PropertySchemaDTO } from '../../../../utils/api-types';
import { Option } from '../../../../utils/Option';
import { useFormatter } from '../../../i18n';
import type { Theme } from '../../../Theme';
import { convertOperatorToIcon } from './FilterUtils';
import useRetrieveOptions from './useRetrieveOptions';

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
    'cursor': 'pointer',
    '&:hover': {
      textDecorationLine: 'underline',
    },
  },
}));

interface Props {
  filter: Filter;
  propertySchema?: PropertySchemaDTO;
  isTooltip?: boolean;
  handleOpen?: () => void;
}

const FilterChipValues: FunctionComponent<Props> = ({
  filter,
  propertySchema,
  isTooltip = false,
  handleOpen,
}) => {
  // Standard hooks
  const { t, fldt } = useFormatter();
  const classes = useStyles();

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
        or = (
          <div className={classNames({
            [classes.mode]: !isTooltip,
            [classes.modeTooltip]: isTooltip,
          })}
          >
            {t('OR')}
          </div>
        );
      }
      if (propertySchema?.schema_property_type.includes('instant')) {
        return (
          <>
            {or}
            <span key={o.id}>
              {' '}
              {fldt(o.label)}
            </span>
          </>
        );
      }
      return (
        <>
          {or}
          <span key={o.id}>
            {' '}
            {o.label}
          </span>
        </>
      );
    });
  };

  const operator = filter.operator ?? 'eq';
  const isOperatorNil = ['empty', 'not_empty'].includes(operator);
  if (isOperatorNil) {
    return (
      <>
        <strong
          className={classNames({ [classes.label]: !!handleOpen })}
          onClick={handleOpen}
        >
          {t(filter.key)}
        </strong>
        {' '}
        <span>
          {operator === 'empty' ? t('is empty') : t('is not empty')}
        </span>
      </>
    );
  }
  return (
    <>
      <span className={classes.container}>
        <strong
          className={classNames({ [classes.label]: !!handleOpen })}
          onClick={handleOpen}
        >
          {t(filter.key)}
          {convertOperatorToIcon(t, filter.operator)}
        </strong>
        {' '}
        <Box sx={{ display: 'flex', flexDirection: 'row', overflow: 'hidden' }}>
          {toValues(options)}
        </Box>
      </span>
    </>
  );
};

export default FilterChipValues;
