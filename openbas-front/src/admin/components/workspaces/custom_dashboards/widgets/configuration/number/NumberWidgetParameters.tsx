import { useEffect } from 'react';
import { type Control, Controller, type UseFormSetValue } from 'react-hook-form';

import type { Widget } from '../../../../../../../utils/api-types-custom';
import { type WidgetInputWithoutLayout } from '../../WidgetUtils';
import WidgetConfigDateAttributeController from '../common/WidgetConfigDateAttributeController';
import WidgetConfigTimeRangeController from '../common/WidgetConfigTimeRangeController';

type Props = {
  widgetType: Widget['widget_type'];
  control: Control<WidgetInputWithoutLayout>;
  setValue: UseFormSetValue<WidgetInputWithoutLayout>;
};

const NumberWidgetParameters = (props: Props) => {
  useEffect(() => {
    props.setValue('widget_config.widget_configuration_type', 'flat');
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
      <WidgetConfigDateAttributeController widgetType={props.widgetType} />
      <WidgetConfigTimeRangeController />
    </>
  );
};

export default NumberWidgetParameters;
