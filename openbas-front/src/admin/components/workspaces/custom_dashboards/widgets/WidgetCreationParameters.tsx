import { Autocomplete, FormControlLabel, MenuItem, Switch, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { type FunctionComponent, useEffect, useState } from 'react';
import { type Control, Controller, useWatch } from 'react-hook-form';

import { engineSchemas } from '../../../../../actions/schema/schema-action';
import { useFormatter } from '../../../../../components/i18n';
import { type PropertySchemaDTO, type WidgetInput } from '../../../../../utils/api-types';
import { type Option } from '../../../../../utils/Option';

const WidgetCreationParameters: FunctionComponent<{ control: Control<WidgetInput> }> = ({ control }) => {
  // Standard hooks
  const { t } = useFormatter();

  const mode = useWatch({
    control,
    name: 'widget_config.mode',
  });

  const [options, setOptions] = useState<Option[]>([]);

  useEffect(() => {
    engineSchemas().then((response: { data: PropertySchemaDTO[] }) => {
      const newOptions = Array.from(
        new Map(
          response.data
            .filter(d => mode === 'temporal' ? d.schema_property_type === 'instant' : d.schema_property_type !== 'instant')
            .map(d => [d.schema_property_name, {
              id: d.schema_property_name,
              label: d.schema_property_name, // FIXME: we have some identical label in back-end
            }]),
        ).values(),
      );
      setOptions(newOptions);
    });
  }, [mode]);

  return (
    <>
      <Controller
        control={control}
        name="widget_config.title"
        render={({ field }) => (
          <TextField
            {...field}
            variant="standard"
            fullWidth
            label={t('Title')}
            value={field.value ?? ''}
            onChange={e => field.onChange(e.target.value)}
          />
        )}
      />
      <Controller
        control={control}
        name="widget_config.mode"
        render={({ field }) => (
          <TextField
            {...field}
            select
            variant="standard"
            fullWidth
            label={t('Mode')}
            sx={{ mt: 2 }}
            value={field.value ?? ''}
            onChange={e => field.onChange(e.target.value)}
          >
            <MenuItem value="structural">{t('Structural')}</MenuItem>
            <MenuItem value="temporal">{t('Temporal')}</MenuItem>
          </TextField>
        )}
      />
      <Controller
        control={control}
        name="widget_config.field"
        render={({ field, fieldState }) => {
          return (
            <Autocomplete
              options={options}
              value={options.find(o => o.label === field.value)}
              onChange={(_, value) => field.onChange(value?.id)}
              renderInput={params => (
                <TextField
                  {...params}
                  label={t('Field')}
                  variant="standard"
                  fullWidth
                  sx={{ mt: 2 }}
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  required={true}
                />
              )}
              freeSolo={false}
            />
          );
        }}
      />
      {mode === 'temporal' && (
        <>
          <Controller
            control={control}
            name="widget_config.interval"
            render={({ field }) => (
              <TextField
                {...field}
                select
                variant="standard"
                fullWidth
                label={t('Mode')}
                sx={{ mt: 2 }}
                value={field.value ?? ''}
                onChange={e => field.onChange(e.target.value)}
              >
                <MenuItem value="day">{t('Day')}</MenuItem>
                <MenuItem value="week">{t('Week')}</MenuItem>
                <MenuItem value="month">{t('Month')}</MenuItem>
                <MenuItem value="quarter">{t('Quarter')}</MenuItem>
                <MenuItem value="year">{t('Year')}</MenuItem>
              </TextField>
            )}
          />
          <Controller
            control={control}
            name="widget_config.start"
            render={({ field, fieldState }) => (
              <DatePicker
                label={t('Start date')}
                sx={{ mt: 2 }}
                value={field.value ? new Date(field.value) : null}
                onChange={date => field.onChange(date?.toISOString() ?? '')}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!fieldState.error,
                    helperText: fieldState.error?.message,
                    required: true,
                  },
                }}
              />
            )}
          />
          <Controller
            control={control}
            name="widget_config.end"
            render={({ field, fieldState }) => (
              <DatePicker
                label={t('End date')}
                sx={{ mt: 2 }}
                value={field.value ? new Date(field.value) : null}
                onChange={date => field.onChange(date?.toISOString() ?? '')}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!fieldState.error,
                    helperText: fieldState.error?.message,
                    required: true,
                  },
                }}
              />
            )}
          />
        </>
      )}
      <Controller
        control={control}
        name="widget_config.stacked"
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
        name="widget_config.display_legend"
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
