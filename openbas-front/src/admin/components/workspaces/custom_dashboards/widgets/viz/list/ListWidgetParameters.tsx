import {useEffect, useState} from 'react';
import {type Control, Controller, type UseFormSetValue, useWatch} from 'react-hook-form';

import type { Widget } from '../../../../../../../utils/api-types-custom';
import {getAvailableFields, getBaseEntities, type WidgetInputWithoutLayout} from '../../WidgetUtils';
import WidgetColumnsCustomizationInput from "./WidgetColumnsCustomizationInput";
import {engineSchemas} from "../../../../../../../actions/schema/schema-action";
import type {PropertySchemaDTO} from "../../../../../../../utils/api-types";
import type {GroupOption} from "../../../../../../../utils/Option";

type Props = {
  widgetType: Widget['widget_type'];
  control: Control<WidgetInputWithoutLayout>;
  setValue: UseFormSetValue<WidgetInputWithoutLayout>;
};

const ListWidgetParameters = (props: Props) => {
    const [entityColumns, setEntityColumns] = useState<{attribute: string, label: string}[]>([]);
    const series = useWatch({
        control: props.control,
        name: 'widget_config.series',
    });
    const columns = useWatch({
        control: props.control,
        name: 'widget_config.columns',
    });
    const entities = series.map(v => getBaseEntities(v.filter)).flat();

  useEffect(() => {
    props.setValue('widget_config.widget_configuration_type', 'list');
  }, []);

    useEffect(() => {
        engineSchemas(entities).then((response: { data: PropertySchemaDTO[] }) => {
            setEntityColumns(response.data.map(d => {
                return {
                    attribute: d.schema_property_name,
                    label: d.schema_property_label,
                }
            }));
        });
    }, [series]);

    const onChange = (new_cols: { attribute: string, label: string}[]) => {
        props.setValue("widget_config.columns", new_cols.map(c => c.attribute));
    }

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
      <Controller control={props.control} name="widget_config.columns" render={() => (
          <WidgetColumnsCustomizationInput
              availableColumns={entityColumns}
              defaultColumns={entityColumns}
              value={entityColumns}
              onChange={onChange}
          />
      )} />
    </>
  );
};

export default ListWidgetParameters;
