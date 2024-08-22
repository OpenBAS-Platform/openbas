import React, { useEffect } from 'react';
import { makeStyles } from '@mui/styles';
import { Autocomplete, Box, TextField } from '@mui/material';
import { RouteOutlined } from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import * as R from 'ramda';
import { fetchKillChainPhases } from '../../../../actions/KillChainPhase';
import { useFormatter } from '../../../../components/i18n';
import { useHelper } from '../../../../store';
import { buildEmptyFilter } from '../../../../components/common/queryable/filter/FilterUtils';

const useStyles = makeStyles(() => ({
  icon: {
    paddingTop: 4,
    display: 'inline-block',
  },
  text: {
    display: 'inline-block',
    flexGrow: 1,
    marginLeft: 10,
  },
}));

const KillChainPhasesFilter = (props) => {
  const { fullWidth, filterKey, helpers } = props;
  const classes = useStyles();
  const { t } = useFormatter();
  const dispatch = useDispatch();
  const killChainPhases = useHelper((helper) => helper.getKillChainPhases());
  useEffect(() => {
    dispatch(fetchKillChainPhases());
    helpers.handleAddFilterWithEmptyValue(buildEmptyFilter(filterKey, 'eq'));
  }, []);
  const killChainPhaseTransform = (n) => ({
    id: n.phase_id,
    label: n.phase_name,
  });
  const sortByOrder = R.sortWith([R.ascend(R.prop('phase_order'))]);
  const killChainPhasesOptions = sortByOrder(killChainPhases).map(killChainPhaseTransform);

  return (
    <>
      <Autocomplete
        style={{ width: fullWidth ? '100%' : 250, float: 'left', marginLeft: 10 }}
        selectOnFocus={true}
        openOnFocus={true}
        autoSelect={false}
        autoHighlight={true}
        size="small"
        options={killChainPhasesOptions}
        onChange={(event, value, reason) => {
          // When removing, a null change is fired
          // We handle directly the remove through the chip deletion.
          if (value !== null) helpers.handleAddSingleValueFilter(filterKey, value.id);
          if (reason === 'clear') helpers.handleAddMultipleValueFilter(filterKey, []);
        }}
        isOptionEqualToValue={(option, value) => value === undefined || value === '' || option.id === value.id}
        renderOption={(p, option) => (
          <Box component="li" {...p} key={option.id}>
            <div className={classes.icon}>
              <RouteOutlined />
            </div>
            <div className={classes.text}>{option.label}</div>
          </Box>
        )}
        renderInput={(params) => (
          <TextField
            label={t('Kill Chain Phase')}
            size="small"
            fullWidth={true}
            variant="outlined"
            {...params}
          />
        )}
      />
    </>
  );
};

export default KillChainPhasesFilter;
