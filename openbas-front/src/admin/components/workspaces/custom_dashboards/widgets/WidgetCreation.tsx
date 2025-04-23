import { type FunctionComponent, useState } from 'react';

import { createCustomDashboardWidget } from '../../../../../actions/custom_dashboards/customdashboardwidget-action';
import ButtonCreate from '../../../../../components/common/ButtonCreate';
import { type Widget } from '../../../../../utils/api-types';
import WidgetForm from './WidgetForm';
import { type WidgetInputWithoutLayout } from './WidgetUtils';

const COL_WIDTH = 30;

const WidgetCreation: FunctionComponent<{
  customDashboardId: string;
  widgets: Widget[];
  onCreate: (widget: Widget) => void;
}> = ({
  customDashboardId,
  widgets,
  onCreate,
}) => {
  // Dialog
  const [open, setOpen] = useState(false);
  const toggleDialog = () => setOpen(prev => !prev);

  // Layout
  const getMaxY = () => {
    return widgets.reduce(
      (max, n) => ((n.widget_layout?.widget_layout_y ?? 0) > max ? (n.widget_layout?.widget_layout_y ?? 0) : max),
      0,
    );
  };

  const getMaxX = () => {
    const y = getMaxY();
    const maxX = widgets
      .filter(n => (n.widget_layout?.widget_layout_y ?? 0) === y)
      .reduce((max, n) => ((n.widget_layout?.widget_layout_x ?? 0) > max ? (n.widget_layout?.widget_layout_x ?? 0) : max), 0);
    return maxX + 4;
  };

  const onSubmit = async (input: WidgetInputWithoutLayout) => {
    let maxX = getMaxX();
    let maxY = getMaxY();
    if (maxX >= COL_WIDTH - 4) {
      maxX = 0;
      maxY += 2;
    }
    const layout = {
      widget_layout_x: maxX,
      widget_layout_y: maxY,
      widget_layout_w: 10,
      widget_layout_h: 10,
    };
    const finalInput = {
      ...input,
      widget_layout: layout,
    };
    await createCustomDashboardWidget(customDashboardId, finalInput).then((result) => {
      onCreate(result.data);
    });
  };

  return (
    <>
      <ButtonCreate onClick={toggleDialog} />
      {
        open
        && (
          <WidgetForm
            open
            toggleDialog={toggleDialog}
            onSubmit={onSubmit}
          />
        )
      }
    </>
  );
};

export default WidgetCreation;
