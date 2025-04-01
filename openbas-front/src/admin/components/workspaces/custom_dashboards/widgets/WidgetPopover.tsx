import { type FunctionComponent, useState } from 'react';

import { deleteCustomDashboardWidget } from '../../../../../actions/custom_dashboards/customdashboardwidget-action';
import type { PopoverEntry } from '../../../../../components/common/ButtonPopover';
import DialogDelete from '../../../../../components/common/DialogDelete';
import IconPopover from '../../../../../components/common/IconPopover';
import { useFormatter } from '../../../../../components/i18n';

interface Props {
  customDashboardId: string;
  widgetId: string;
  className: string;
  onDelete: (widgetId: string) => void;
}

const WidgetPopover: FunctionComponent<Props> = ({
  customDashboardId,
  widgetId,
  className,
  onDelete,
}) => {
  // Standard hooks
  const { t } = useFormatter();

  // Deletion
  const [openDelete, setOpenDelete] = useState(false);
  const handleOpenDelete = () => setOpenDelete(true);
  const handleCloseDelete = () => setOpenDelete(false);
  const submitDelete = () => {
    deleteCustomDashboardWidget(customDashboardId, widgetId);
    if (onDelete) {
      onDelete(widgetId);
    }
  };

  const entries: PopoverEntry[] = [
    {
      label: 'Delete',
      action: handleOpenDelete,
    },
  ];

  return (
    <div
      className={className}
      style={{
        top: 0,
        right: 0,
        margin: 0,
        position: 'absolute',
        zIndex: 1,
      }}
    >
      <IconPopover entries={entries} />
      <DialogDelete
        open={openDelete}
        handleClose={handleCloseDelete}
        handleSubmit={submitDelete}
        text={t('Do you want to delete this widget?')}
      />
    </div>
  );
};

export default WidgetPopover;
