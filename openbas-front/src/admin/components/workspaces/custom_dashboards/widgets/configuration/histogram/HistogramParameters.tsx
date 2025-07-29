import { Autocomplete, MenuItem, TextField } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers';
import { useEffect, useState } from 'react';
import { type Control, Controller, type UseFormSetValue, useWatch } from 'react-hook-form';

import { engineSchemas } from '../../../../../../../actions/schema/schema-action';
import { useFormatter } from '../../../../../../../components/i18n';
import { type PropertySchemaDTO } from '../../../../../../../utils/api-types';
import { type Widget } from '../../../../../../../utils/api-types-custom';
import { type GroupOption } from '../../../../../../../utils/Option';
import {
  getAvailableModes,
  getBaseEntities, getLimit,
  type WidgetInputWithoutLayout,
} from '../../WidgetUtils';
import getEntityPropertiesListOptions from '../EntityPropertiesListOptions';

type Props = {
  widgetType: Widget['widget_type'];
  control: Control<WidgetInputWithoutLayout>;
  setValue: UseFormSetValue<WidgetInputWithoutLayout>;
  showOnlyTitle?: boolean;
};

const HistogramParameters = ({ widgetType, control, setValue }: Props) => {
// Standard hooks
  const { t } = useFormatter();
  const theme = useTheme();

  // -- WATCH --
  const mode = useWatch({
    control,
    name: 'widget_config.mode',
  });
  const widgetTimeRange = useWatch({
    control,
    name: 'widget_config.timeRange',
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

  const hasLimit = getLimit(widgetType);

  // -- HANDLE widget config type --
  useEffect(() => {
    switch (mode) {
      case 'structural':
        setValue('widget_config.widget_configuration_type', 'structural-histogram');
        break;
      case 'temporal':
        setValue('widget_config.widget_configuration_type', 'temporal-histogram');
        break;
      default:
        setValue('widget_config.widget_configuration_type', 'structural-histogram');
    }
  }, [mode]);

  // -- HANDLE FIELDS --
  const [fieldOptions, setFieldOptions] = useState<GroupOption[]>([]);

  useEffect(() => {
    engineSchemas(entities).then((response: { data: PropertySchemaDTO[] }) => {
      const finalOptions = getEntityPropertiesListOptions(
        response.data,
        widgetType,
        d => mode === 'temporal' ? d.schema_property_type === 'instant' : d.schema_property_type !== 'instant')
        .map((o) => {
          return {
            ...o,
            label: t(o.label),
          };
        });
      setFieldOptions(finalOptions);
      if (finalOptions.length === 1) {
        setValue('widget_config.field', finalOptions[0].id); // If only one option is available, hide the field and set it automatically
      }
    });
  }, [mode]);

  const timeRangeItems = [
    {
      value: 'DEFAULT',
      label: t('Dashboard time range'),
    },
    {
      value: 'ALL_TIME',
      label: t('All time'),
    },
    {
      value: 'CUSTOM',
      label: t('Custom range'),
    },
    {
      value: 'LAST_DAY',
      label: t('Last 24 hours'),
    },
    {
      value: 'LAST_WEEK',
      label: t('Last 7 days'),
    },
    {
      value: 'LAST_MONTH',
      label: t('Last month'),
    },
    {
      value: 'LAST_QUARTER',
      label: t('Last 3 months'),
    },
    {
      value: 'LAST_SEMESTER',
      label: t('Last 6 months'),
    },
    {
      value: 'LAST_YEAR',
      label: t('Last year'),
    },
  ];

  return (
    <>
      <Controller
        control={control}
        name="widget_config.widget_configuration_type"
        render={({ field }) => (
          <input
            {...field}
            type="hidden"
            value={field.value ?? ''}
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
                required
              >
                {availableModes.map(mode => <MenuItem key={mode} value={mode}>{t(mode)}</MenuItem>)}
              </TextField>
            )}
          />
        )}
      {hasLimit && (
        <Controller
          control={control}
          name="widget_config.limit"
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              variant="standard"
              fullWidth
              type="number"
              label={t('Number of results')}
              sx={{ mt: 2 }}
              value={field.value ?? 10}
              onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
              required
            />
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
                      label={t('Date attribute')}
                      variant="standard"
                      fullWidth
                      sx={{ mt: 2 }}
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      required
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
                required
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
            name="widget_config.timeRange"
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                select
                variant="standard"
                fullWidth
                label={t('Time range')}
                sx={{ mt: 2 }}
                value={field.value ?? ''}
                onChange={e => field.onChange(e.target.value)}
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
                required
              >
                {timeRangeItems.map(timeRange => <MenuItem key={timeRange.value} value={timeRange.value}>{t(timeRange.label)}</MenuItem>)}
              </TextField>
            )}
          />
          {
            widgetTimeRange === 'CUSTOM' && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: theme.spacing(2),
              }}
              >
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
                          required: widgetTimeRange === 'CUSTOM',
                          fullWidth: true,
                          error: !!fieldState.error,
                          helperText: fieldState.error?.message,
                          variant: 'standard',
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
                          required: widgetTimeRange === 'CUSTOM',
                          fullWidth: true,
                          error: !!fieldState.error,
                          helperText: fieldState.error?.message,
                          variant: 'standard',
                        },
                      }}
                    />
                  )}
                />
              </div>
            )
          }

        </>
      )}
    </>
  );
};

export default HistogramParameters;
