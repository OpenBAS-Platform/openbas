import { useEffect } from 'react';
import { type Control, Controller, type UseFormSetValue } from 'react-hook-form';

import type { Widget } from '../../../../../../../utils/api-types-custom';
import { type WidgetInputWithoutLayout } from '../../WidgetUtils';

type Props = {
  widgetType: Widget['widget_type'];
  control: Control<WidgetInputWithoutLayout>;
  setValue: UseFormSetValue<WidgetInputWithoutLayout>;
};

const ListWidgetParameters = (props: Props) => {
  useEffect(() => {
    props.setValue('widget_config.widget_configuration_type', 'list');
  }, []);
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
    </>
  );
};

export default ListWidgetParameters;
