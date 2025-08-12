import { Autocomplete, MenuItem, TextField } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers';
import { useEffect, useState } from 'react';
import { type Control, Controller, type UseFormSetValue, useWatch } from 'react-hook-form';

import { engineSchemas } from '../../../../../../../actions/schema/schema-action';
import { useFormatter } from '../../../../../../../components/i18n';
import type { PropertySchemaDTO } from '../../../../../../../utils/api-types';
import type { Widget } from '../../../../../../../utils/api-types-custom';
import { type GroupOption } from '../../../../../../../utils/Option';
import { getBaseEntities, type WidgetInputWithoutLayout } from '../../WidgetUtils';
import getEntityPropertiesListOptions from '../EntityPropertiesListOptions';
import WidgetColumnsCustomizationInput from './WidgetColumnsCustomizationInput';

type Props = {
  widgetType: Widget['widget_type'];
  control: Control<WidgetInputWithoutLayout>;
  setValue: UseFormSetValue<WidgetInputWithoutLayout>;
};

const ListWidgetParameters = (props: Props) => {
  const { t } = useFormatter();
  const theme = useTheme();
  const [propertySelection, setPropertySelection] = useState<GroupOption[]>([]);
  const [entityColumns, setEntityColumns] = useState<{
    attribute: string;
    label: string;
  }[]>([]);
  const perspective = useWatch({
    control: props.control,
    name: 'widget_config.perspective',
  });
  const columns = useWatch({
    control: props.control,
    name: 'widget_config.columns',
  });
  const widgetTimeRange = useWatch({
    control: props.control,
    name: 'widget_config.time_range',
  });
  const entities = [perspective].map(v => getBaseEntities(v.filter)).flat();

  const onColumnSelectionChange = (new_cols: {
    attribute: string;
    label: string;
  }[]) => {
    props.setValue('widget_config.columns', new_cols.map(c => c.attribute));
  };

  useEffect(() => {
    props.setValue('widget_config.widget_configuration_type', 'list');
  }, []);

  // get the entity schema for column names
  useEffect(() => {
    engineSchemas(entities).then((response: { data: PropertySchemaDTO[] }) => {
      const finalOptions = getEntityPropertiesListOptions(
        response.data,
        props.widgetType).map((o) => {
        return {
          ...o,
          label: t(o.label),
        };
      });
      setPropertySelection(finalOptions);
      const newCols = finalOptions
        // we will hide all "side" columns unless it is the tags column
        .filter(o => !o.id.endsWith('_side') || o.id === 'base_tags_side')
        .map((d) => {
          return {
            attribute: d.id,
            label: d.label,
          };
        });
      setEntityColumns(newCols.toSorted((a, b) => a.label.localeCompare(b.label)));

      if (!columns) {
        onColumnSelectionChange(newCols);
      }
    });
  }, [perspective]);

  const [structuralDateOptions, setStructuralDateOptions] = useState<GroupOption[]>([]);
  useEffect(() => {
    engineSchemas(entities).then((response: { data: PropertySchemaDTO[] }) => {
      const finalOptions = getEntityPropertiesListOptions(
        response.data,
        props.widgetType,
        d => d.schema_property_type === 'instant')
        .map((o) => {
          return {
            ...o,
            label: t(o.label),
          };
        });
      setStructuralDateOptions(finalOptions);
    });
  });

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
        control={props.control}
        name="widget_config.widget_configuration_type"
        render={({ field }) => (
          <input
            {...field}
            type="hidden"
            value={field.value ?? ''}
          />
        )}
      />
      <Controller
        control={props.control}
        name="widget_config.sorts.0.fieldName"
        render={({ field, fieldState }) => (
          <Autocomplete
            options={propertySelection}
            groupBy={option => option.group}
            value={propertySelection.find(o => o.id === field.value) ?? null}
            onChange={(_, value) => field.onChange(value?.id)}
            getOptionLabel={option => option.label ?? ''}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={params => (
              <TextField
                {...params}
                label={t('Sort field')}
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
        )}
      />
      <Controller
        control={props.control}
        name="widget_config.sorts.0.direction"
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            select
            variant="standard"
            fullWidth
            label={t('Direction')}
            sx={{ mt: 2 }}
            value={field.value ?? ''}
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
            onChange={e => field.onChange(e.target.value)}
            required={true}
          >
            {['ASC', 'DESC'].map(dir => <MenuItem key={dir} value={dir}>{t(dir)}</MenuItem>)}
          </TextField>
        )}
      />
      <Controller
        control={props.control}
        name="widget_config.limit"
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            variant="standard"
            fullWidth
            type="number"
            label={t('Number of results')}
            sx={{ mt: 2 }}
            value={field.value ?? 100}
            onChange={e => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
            required
          />
        )}
      />

      <Controller
        control={props.control}
        name="widget_config.date_attribute"
        render={({ field, fieldState }) => {
          return (
            <Autocomplete
              options={structuralDateOptions}
              groupBy={option => option.group}
              value={structuralDateOptions.find(o => o.id === field.value) ?? null}
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

      <Controller
        control={props.control}
        name="widget_config.time_range"
        defaultValue="DEFAULT"
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
              control={props.control}
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
              control={props.control}
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

      <Controller
        control={props.control}
        name="widget_config.columns"
        render={({ field }) => (
          <WidgetColumnsCustomizationInput
            availableColumns={entityColumns}
            defaultColumns={entityColumns}
            value={field.value?.map(v => entityColumns.find(ev => ev.attribute === v) ?? null).filter(v => v !== null) ?? entityColumns}
            onChange={onColumnSelectionChange}
          />
        )}
      />
    </>
  );
};

export default ListWidgetParameters;
