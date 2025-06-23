import { useEffect, useState } from 'react';
import { type Control, Controller, type UseFormSetValue, useWatch } from 'react-hook-form';

import { engineSchemas } from '../../../../../../../actions/schema/schema-action';
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
  const [entityColumns, setEntityColumns] = useState<{
    attribute: string;
    label: string;
  }[]>([]);
  const series = useWatch({
    control: props.control,
    name: 'widget_config.series',
  });
  const entities = series.map(v => getBaseEntities(v.filter)).flat();

  useEffect(() => {
    props.setValue('widget_config.widget_configuration_type', 'list');
  }, []);

  // get the entity schema for column names
  useEffect(() => {
    engineSchemas(entities).then((response: { data: PropertySchemaDTO[] }) => {
      setEntityColumns(response.data.map((d) => {
        return {
          attribute: d.schema_property_name,
          label: d.schema_property_label,
        };
      }));
    });
  }, [series]);

  const onChange = (new_cols: {
    attribute: string;
    label: string;
  }[]) => {
    props.setValue('widget_config.columns', new_cols.map(c => c.attribute));
  };

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
        name="widget_config.columns"
        render={({ field }) => (
          <WidgetColumnsCustomizationInput
            availableColumns={entityColumns}
            defaultColumns={entityColumns}
            value={field.value?.map(v => entityColumns.find(ev => ev.attribute === v) ?? null).filter(v => v !== null) ?? entityColumns}
            onChange={onChange}
          />
        )}
      />
    </>
  );
};

export default ListWidgetParameters;
