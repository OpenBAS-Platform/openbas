import { MenuItem, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import { type Control, Controller, type UseFormSetValue, useWatch } from 'react-hook-form';

import { engineSchemas } from '../../../../../../../actions/schema/schema-action';
import { useFormatter } from '../../../../../../../components/i18n';
import type { PropertySchemaDTO } from '../../../../../../../utils/api-types';
import type { Widget } from '../../../../../../../utils/api-types-custom';
import { getBaseEntities, type WidgetInputWithoutLayout } from '../../WidgetUtils';
import WidgetColumnsCustomizationInput from './WidgetColumnsCustomizationInput';

type Props = {
  widgetType: Widget['widget_type'];
  control: Control<WidgetInputWithoutLayout>;
  setValue: UseFormSetValue<WidgetInputWithoutLayout>;
};

const ListWidgetParameters = (props: Props) => {
  const { t } = useFormatter();
  const [entityColumns, setEntityColumns] = useState<{
    attribute: string;
    label: string;
  }[]>([]);
  const series = useWatch({
    control: props.control,
    name: 'widget_config.series',
  });
  const columns = useWatch({
    control: props.control,
    name: 'widget_config.columns',
  });
  const entities = series.map(v => getBaseEntities(v.filter)).flat();

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
      const newCols = response.data.map((d) => {
        return {
          attribute: d.schema_property_name,
          label: d.schema_property_label,
        };
      });
      setEntityColumns(newCols);

      if (!columns) {
        onColumnSelectionChange(newCols);
      }
    });
  }, [series]);

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
          <TextField
            {...field}
            select
            variant="standard"
            fullWidth
            label={t('Sort field')}
            sx={{ mt: 2 }}
            value={field.value ?? ''}
            error={!!fieldState.error}
            helperText={fieldState.error?.message}
            onChange={e => field.onChange(e.target.value)}
            required={true}
          >
            {entityColumns.map(col => <MenuItem key={col.attribute} value={col.attribute}>{t(col.label)}</MenuItem>)}
          </TextField>
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
