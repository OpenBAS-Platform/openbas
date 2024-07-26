import React, { FunctionComponent } from 'react';
import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { FilterHelpers } from './FilterHelpers';
import type { Filter, FilterGroup, PropertySchemaDTO } from '../../../../utils/api-types';
import FilterChip from './FilterChip';
import { useFormatter } from '../../../i18n';
import type { Theme } from '../../../Theme';

const useStyles = makeStyles((theme: Theme) => ({
  mode: {
    borderRadius: 4,
    fontFamily: 'Consolas, monaco, monospace',
    backgroundColor: theme.palette.action?.selected,
    padding: '0 8px',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: theme.palette.action?.disabled,
      textDecorationLine: 'underline',
    },
  },
}));

interface Props {
  propertySchemas: PropertySchemaDTO[];
  filterGroup: FilterGroup;
  availableFilterNames?: string[];
  helpers: FilterHelpers;
  pristine: boolean;
}

const FilterChips: FunctionComponent<Props> = ({
  propertySchemas,
  filterGroup,
  availableFilterNames = [],
  helpers,
  pristine,
}) => {
  // Standard hooks
  const classes = useStyles();
  const { t } = useFormatter();

  const propertySchema = (filter: Filter) => {
    return propertySchemas.find((p) => p.schema_property_name === filter.key);
  };

  const handleSwitchMode = () => helpers.handleSwitchMode();

  return (
    <Box
      sx={{
        padding: '12px 4px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1,
      }}
    >
      {filterGroup.filters?.filter((f) => availableFilterNames.length === 0 || availableFilterNames.includes(f.key))
        .map((filter, idx) => {
          const property = propertySchema(filter);
          if (!property) {
            return (<React.Fragment key={filter.key}></React.Fragment>);
          }
          return (
            <React.Fragment key={filter.key}>
              {idx !== 0
                && <div onClick={handleSwitchMode} className={classes.mode}>
                  {t(filterGroup.mode.toUpperCase())}
                </div>}
              <FilterChip
                filter={filter}
                helpers={helpers}
                propertySchema={property}
                pristine={pristine}
              />
            </React.Fragment>
          );
        })
      }
    </Box>
  );
};

export default FilterChips;
