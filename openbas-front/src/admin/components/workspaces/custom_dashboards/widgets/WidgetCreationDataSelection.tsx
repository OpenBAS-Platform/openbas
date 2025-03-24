import { CancelOutlined, LabelOutlined } from '@mui/icons-material';
import { Autocomplete as MuiAutocomplete, Box, IconButton, TextField } from '@mui/material';
import { type FunctionComponent, useState } from 'react';
import { makeStyles } from 'tss-react/mui';

import FilterField from '../../../../../components/common/queryable/filter/FilterField';
import { emptyFilterGroup } from '../../../../../components/common/queryable/filter/FilterUtils';
import useFiltersState from '../../../../../components/common/queryable/filter/useFiltersState';
import { useFormatter } from '../../../../../components/i18n';
import { type FilterGroup, type WidgetDataSelection } from '../../../../../utils/api-types';

const useStyles = makeStyles()(theme => ({
  step_entity: {
    position: 'relative',
    width: '100%',
    margin: '0 0 20px 0',
    padding: 15,
    verticalAlign: 'middle',
    border: `1px solid ${theme.palette.secondary.main}`,
    borderRadius: 4,
  },
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

const WidgetCreationDataSelection: FunctionComponent<{
  index: number;
  dataSelection: WidgetDataSelection;
  onChange: (dataSelection: WidgetDataSelection) => void;
  onRemove: (index: number) => void;
}> = ({ index, dataSelection, onChange, onRemove }) => {
  // Standard hooks
  const { classes } = useStyles();
  const { t } = useFormatter();

  const [label, setLabel] = useState<string>(dataSelection.widget_data_selection_label ?? '');
  const onChangeLabel = (label: string) => {
    setLabel(label);
    onChange({
      ...dataSelection,
      widget_data_selection_label: label,
    });
  };

  const onChangeFilterGroup = (filterGroup: FilterGroup) => {
    onChange({
      ...dataSelection,
      widget_data_selection_filter: filterGroup,
    });
  };
  const [filterGroup, helpers] = useFiltersState(emptyFilterGroup, undefined, onChangeFilterGroup);

  const options = ['finding'].map(// FIXME: need an API to retrieve everything
    n => ({
      id: n,
      label: n,
    }),
  );

  const value = () => {
    return options.filter(option => label?.includes(option.label))[0];
  };

  const handleRemoveDataSelection = () => {
    onRemove(index);
  };

  return (
    <div className={classes.step_entity}>
      <IconButton
        disabled={index === 0}
        aria-label="Delete"
        style={{
          position: 'absolute',
          top: -20,
          right: -20,
        }}
        onClick={handleRemoveDataSelection}
        size="large"
      >
        <CancelOutlined fontSize="small" />
      </IconButton>
      <div style={{ display: 'flex' }}>
        <MuiAutocomplete
          value={value()}
          fullWidth
          selectOnFocus
          autoHighlight
          clearOnBlur={false}
          clearOnEscape={false}
          options={options}
          onChange={(_, value) => {
            onChangeLabel(value?.label ?? '');
          }}
          renderOption={(props, option) => (
            <Box component="li" {...props} key={option.id}>
              <div className={classes.icon}>
                <LabelOutlined />
              </div>
              <div className={classes.text}>{option.label}</div>
            </Box>
          )}
          getOptionLabel={option => option.label}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          renderInput={params => (
            <TextField
              {...params}
              label={`${t('Label (entities)')}`}
              variant="standard"
              fullWidth
            />
          )}
        />
      </div>
      <FilterField
        entityPrefix="" // FIXME: generic filter
        filterGroup={filterGroup}
        helpers={helpers}
        style={{ marginTop: 20 }}
      />
    </div>
  );
};

export default WidgetCreationDataSelection;
