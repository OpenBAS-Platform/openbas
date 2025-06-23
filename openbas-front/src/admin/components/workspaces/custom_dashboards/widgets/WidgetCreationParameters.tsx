import { Autocomplete, MenuItem, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { type FunctionComponent, useEffect, useState } from 'react';
import { type Control, Controller, type UseFormSetValue, useWatch } from 'react-hook-form';

import { engineSchemas } from '../../../../../actions/schema/schema-action';
import { useFormatter } from '../../../../../components/i18n';
import { type PropertySchemaDTO } from '../../../../../utils/api-types';
import { type Widget } from '../../../../../utils/api-types-custom';
import { type GroupOption } from '../../../../../utils/Option';
import ListWidgetParameters from './viz/list/ListWidgetParameters';
import { getAvailableFields, getAvailableModes, getBaseEntities, type WidgetInputWithoutLayout } from './WidgetUtils';
import HistogramParameters from "./HistogramParameters";

const WidgetCreationParameters: FunctionComponent<{
  widgetType: Widget['widget_type'];
  control: Control<WidgetInputWithoutLayout>;
  setValue: UseFormSetValue<WidgetInputWithoutLayout>;
}> = ({ widgetType, control, setValue }) => {
  // Standard hooks
  const { t } = useFormatter();
  const getParametersControl = (widgetType: Widget['widget_type']) => {
    switch (widgetType) {
      case 'list': return <ListWidgetParameters />;
      default: return <HistogramParameters setValue={setValue} control={control} widgetType={widgetType} />;
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
