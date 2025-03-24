import { FormControlLabel, MenuItem, Switch, TextField } from '@mui/material';
import { type FunctionComponent } from 'react';
import { type Control, Controller } from 'react-hook-form';

import { useFormatter } from '../../../../../components/i18n';
import { type WidgetInput } from '../../../../../utils/api-types';

const WidgetCreationParameters: FunctionComponent<{ control: Control<WidgetInput> }> = ({ control }) => {
  // Standard hooks
  const { t } = useFormatter();

  return (
    <>
      <Controller
        control={control}
        name="widget_parameters.widget_parameters_title"
        render={({ field }) => (
          <TextField
            {...field}
            variant="standard"
            fullWidth
            label={t('Title')}
            style={{ marginTop: 10 }}
          />
        )}
      />
      <Controller
        control={control}
        name="widget_parameters.widget_parameters_mode"
        render={({ field }) => (
          <TextField
            {...field}
            select
            variant="standard"
            fullWidth
            label={t('Mode')}
            style={{ marginTop: 20 }}
          >
            <MenuItem value="structure">{t('Structure')}</MenuItem>
            <MenuItem value="temporal">{t('Temporal')}</MenuItem>
          </TextField>
        )}
      />
      <Controller
        control={control}
        name="widget_parameters.widget_parameters_stacked"
        render={({ field }) => (
          <FormControlLabel
            style={{ marginTop: 20 }}
            control={(
              <Switch
                checked={field.value ?? false}
                onChange={field.onChange}
              />
            )}
            label={t('Stacked')}
          />
        )}
      />
      <Controller
        control={control}
        name="widget_parameters.widget_parameters_display_legend"
        render={({ field }) => (
          <FormControlLabel
            style={{ marginTop: 20 }}
            control={(
              <Switch
                checked={field.value ?? false}
                onChange={field.onChange}
              />
            )}
            label={t('Display legend')}
          />
        )}
      />
    </>
  );
};

export default WidgetCreationParameters;
