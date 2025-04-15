import { Autocomplete, MenuItem, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { type FunctionComponent, useEffect, useState } from 'react';
import { type Control, Controller, type UseFormSetValue, useWatch } from 'react-hook-form';

import { engineSchemas } from '../../../../../actions/schema/schema-action';
import { useFormatter } from '../../../../../components/i18n';
import { type PropertySchemaDTO, type Widget } from '../../../../../utils/api-types';
import { type GroupOption } from '../../../../../utils/Option';
import { getAvailableFields, getAvailableModes, getBaseEntities, type WidgetInputWithoutLayout } from './WidgetUtils';

const WidgetCreationParameters: FunctionComponent<{
  widgetType: Widget['widget_type'];
  control: Control<WidgetInputWithoutLayout>;
  setValue: UseFormSetValue<WidgetInputWithoutLayout>;
}> = ({ widgetType, control, setValue }) => {
  // Standard hooks
  const { t } = useFormatter();

  // -- WATCH --
  const mode = useWatch({
    control,
    name: 'widget_config.mode',
  });
  const interval = useWatch({
    control,
    name: 'widget_config.interval',
  });
  const series = useWatch({
    control,
    name: 'widget_config.series',
  });
  const entities = series.map(v => getBaseEntities(v.filter)).flat();

  // -- HANDLE MODE --
  const availableModes = getAvailableModes(widgetType);
  useEffect(() => {
    if (availableModes.length === 1) {
      setValue('widget_config.mode', availableModes[0]); // If only one mode is available, hide the field and set it automatically
    }
  }, []);

  // -- HANDLE FIELDS --
  const [fieldOptions, setFieldOptions] = useState<GroupOption[]>([]);

  useEffect(() => {
    engineSchemas(entities).then((response: { data: PropertySchemaDTO[] }) => {
      const newOptions: GroupOption[] = response.data
        .filter(d => mode === 'temporal' ? d.schema_property_type === 'instant' : d.schema_property_type !== 'instant')
        .reduce<GroupOption[]>((acc, d) => {
          let group = 'Specific properties';
          if (d.schema_property_name.includes('_side')) {
            group = 'Relationship properties';
          } else if (d.schema_property_name.includes('base_')) {
            group = 'Common properties';
          }
          acc.push({
            id: d.schema_property_name,
            label: d.schema_property_label,
            group,
          });
          return acc;
        }, [])
        .sort((a, b) => {
          if (a.group < b.group) return -1;
          if (a.group > b.group) return 1;
          return a.label.localeCompare(b.label);
        });
      const availableFields = getAvailableFields(widgetType);
      const finalOptions = !availableFields ? newOptions : newOptions.filter(o => availableFields.includes(o.id));
      setFieldOptions(finalOptions);
      if (finalOptions.length === 1) {
        setValue('widget_config.field', finalOptions[0].id); // If only one option is available, hide the field and set it automatically
      }
    });
  }, [mode]);

  useEffect(() => {
    if (mode === 'temporal' && !interval) {
      setValue('widget_config.interval', 'day');
    }
  }, [mode, interval, control]);

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
      {availableModes.length > 1
        && (
          <Controller
            control={control}
            name="widget_config.mode"
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                select
                variant="standard"
                fullWidth
                label={t('Mode')}
                sx={{ mt: 2 }}
                value={field.value ?? ''}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                onChange={e => field.onChange(e.target.value)}
                required={true}
              >
                {availableModes.map(mode => <MenuItem key={mode} value={mode}>{t(mode)}</MenuItem>)}
              </TextField>
            )}
          />
        )}
      {fieldOptions.length > 1
        && (
          <Controller
            control={control}
            name="widget_config.field"
            render={({ field, fieldState }) => {
              return (
                <Autocomplete
                  options={fieldOptions}
                  groupBy={option => option.group}
                  value={fieldOptions.find(o => o.id === field.value) ?? null}
                  onChange={(_, value) => field.onChange(value?.id)}
                  getOptionLabel={option => option.label ?? ''}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
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
        )}
      {mode === 'temporal' && (
        <>
          <Controller
            control={control}
            name="widget_config.interval"
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                select
                variant="standard"
                fullWidth
                label={t('Interval')}
                sx={{ mt: 2 }}
                value={field.value ?? ''}
                onChange={e => field.onChange(e.target.value)}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                required={true}
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
                    required: true,
                    fullWidth: true,
                    error: !!fieldState.error,
                    helperText: fieldState.error?.message,
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
                    required: true,
                    fullWidth: true,
                    error: !!fieldState.error,
                    helperText: fieldState.error?.message,
                  },
                }}
              />
            )}
          />
        </>
      )}
      {/* TODO: not functionnal for now */}
      {/* <Controller */}
      {/*  control={control} */}
      {/*  name="widget_config.stacked" */}
      {/*  render={({ field }) => ( */}
      {/*    <FormControlLabel */}
      {/*      style={{ marginTop: 20 }} */}
      {/*      control={( */}
      {/*        <Switch */}
      {/*          checked={field.value ?? false} */}
      {/*          onChange={field.onChange} */}
      {/*        /> */}
      {/*      )} */}
      {/*      label={t('Stacked')} */}
      {/*    /> */}
      {/*  )} */}
      {/* /> */}
      {/* TODO: not functionnal for now */}
      {/* <Controller */}
      {/*  control={control} */}
      {/*  name="widget_config.display_legend" */}
      {/*  render={({ field }) => ( */}
      {/*    <FormControlLabel */}
      {/*      style={{ marginTop: 20 }} */}
      {/*      control={( */}
      {/*        <Switch */}
      {/*          checked={field.value ?? false} */}
      {/*          onChange={field.onChange} */}
      {/*        /> */}
      {/*      )} */}
      {/*      label={t('Display legend')} */}
      {/*    /> */}
      {/*  )} */}
      {/* /> */}
    </>
  );
};

export default WidgetCreationParameters;
