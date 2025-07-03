import { TextField } from '@mui/material';
import { type FunctionComponent } from 'react';
import { type Control, Controller, type UseFormSetValue } from 'react-hook-form';

import { useFormatter } from '../../../../../components/i18n';
import { type Widget } from '../../../../../utils/api-types-custom';
import HistogramParameters from './HistogramParameters';
import ListWidgetParameters from './viz/list/ListWidgetParameters';
import { type WidgetInputWithoutLayout } from './WidgetUtils';

const WidgetCreationParameters: FunctionComponent<{
  widgetType: Widget['widget_type'];
  control: Control<WidgetInputWithoutLayout>;
  setValue: UseFormSetValue<WidgetInputWithoutLayout>;
}> = ({ widgetType, control, setValue }) => {
  // Standard hooks
  const { t } = useFormatter();
  const getParametersControl = (widgetType: Widget['widget_type']) => {
    switch (widgetType) {
      case 'list': return <ListWidgetParameters setValue={setValue} control={control} widgetType={widgetType} />;
      default: return <HistogramParameters setValue={setValue} control={control} widgetType={widgetType} hideLimitField={widgetType == 'attack-path'} />;
    }
  };

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
      {getParametersControl(widgetType)}
    </>
  );
};

export default WidgetCreationParameters;
