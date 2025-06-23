import type { Control, UseFormSetValue } from 'react-hook-form';

import { useFormatter } from '../../../../../../../components/i18n';
import type { Widget } from '../../../../../../../utils/api-types-custom';
import type { WidgetInputWithoutLayout } from '../../WidgetUtils';

type Props = {
  widgetType: Widget['widget_type'];
  control: Control<WidgetInputWithoutLayout>;
  setValue: UseFormSetValue<WidgetInputWithoutLayout>;
};

const ListWidgetParameters = (_props: Props) => {
  const { t } = useFormatter();
  return (
    <p>
      {t('hello list')}
    </p>
  );
};

export default ListWidgetParameters;
