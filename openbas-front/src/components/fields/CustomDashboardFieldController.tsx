import { InsertChartOutlined } from '@mui/icons-material';
import { Autocomplete, Box, TextField, Tooltip } from '@mui/material';
import { type Control, Controller, type FieldValues, type Path } from 'react-hook-form';
import { makeStyles } from 'tss-react/mui';

import type { Option } from '../../utils/Option';
import { useFormatter } from '../i18n';

const useStyles = makeStyles()(() => ({
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

interface Props<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  fetchOptions: (searchText: string) => void;
  options: Option[];
}

const CustomDashboardFieldController = <T extends FieldValues>({
  name,
  control,
  label,
  fetchOptions,
  options,
}: Props<T>) => {
  const { t } = useFormatter();
  const { classes } = useStyles();

  const values = (fieldValue: string) => {
    return options.find(o => fieldValue?.includes(o.id));
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <Autocomplete
          value={values(value) ?? null}
          selectOnFocus
          openOnFocus
          autoHighlight
          noOptionsText={t('No available options')}
          options={options}
          getOptionLabel={option => option.label ?? ''}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          onInputChange={(_, search, reason) => {
            if (reason === 'input') {
              fetchOptions(search);
            }
          }}
          onChange={(_, value) => {
            if (value === null) {
              onChange('');
            } else {
              onChange(value.id);
            }
          }}
          renderInput={paramsInput => (
            <TextField
              {...paramsInput}
              label={label}
              size="small"
              error={!!error}
              helperText={error ? error.message : null}
            />
          )}
          renderOption={(props, option) => {
            const { key, ...rest } = props;
            return (
              <Tooltip key={key} title={option.label}>
                <Box component="li" {...rest}>
                  <div className={classes.icon} style={{ color: option.color }}>
                    <InsertChartOutlined />
                  </div>
                  <div className={classes.text}>{option.label}</div>
                </Box>
              </Tooltip>
            );
          }}
        />
      )}
    />
  );
};

export default CustomDashboardFieldController;
