import React, { FunctionComponent } from 'react';
import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { FilterHelpers } from './FilterHelpers';
import type { Filter, FilterGroup, PropertySchemaDTO } from '../../../utils/api-types';
import FilterChip from './FilterChip';
import { useFormatter } from '../../i18n';
import type { Theme } from '../../Theme';

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
  filterGroup: FilterGroup;
  helpers: FilterHelpers;
  propertySchemas: PropertySchemaDTO[];
}

const FilterChips: FunctionComponent<Props> = ({
  filterGroup,
  helpers,
  propertySchemas,
}) => {
  // Standard hooks
  const classes = useStyles();
  const { t } = useFormatter();

  const propertySchema = (filter: Filter) => {
    return propertySchemas.find((p) => p.schema_property_name === filter.key);
  };

  const handleSwitchMode = () => {
    helpers.handleSwitchMode();
  };

  return (
    <Box
      sx={{
        padding: '12px 4px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 1,
      }}
    >
      {filterGroup.filters?.map((filter, idx) => {
        const property = propertySchema(filter);
        if (!property) {
          return (<></>);
        }
        return (
          <>
            {idx !== 0
              && <div
                onClick={handleSwitchMode}
                className={classes.mode}
                 >
                {t(filterGroup.mode.toUpperCase())}
              </div>}
            <FilterChip
              filter={filter}
              helpers={helpers}
              propertySchema={property}
            />
          </>
        );
      })
      }
    </Box>
  );
};
export default FilterChips;
