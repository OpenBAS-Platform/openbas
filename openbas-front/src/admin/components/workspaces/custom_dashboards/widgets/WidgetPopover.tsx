import { type IconButtonProps } from '@mui/material';
import { type FunctionComponent, useState } from 'react';

import { deleteCustomDashboardWidget, updateCustomDashboardWidget } from '../../../../../actions/custom_dashboards/customdashboardwidget-action';
import type { PopoverEntry } from '../../../../../components/common/ButtonPopover';
import DialogDelete from '../../../../../components/common/DialogDelete';
import IconPopover from '../../../../../components/common/IconPopover';
import { useFormatter } from '../../../../../components/i18n';
import { type Widget } from '../../../../../utils/api-types';
import WidgetForm from './WidgetForm';
import { type WidgetInputWithoutLayout } from './WidgetUtils';

interface Props {
  customDashboardId: string;
  widget: Widget;
  size: IconButtonProps['size'];
  className: string;
  onUpdate: (widget: Widget) => void;
  onDelete: (widgetId: string) => void;
}

const WidgetPopover: FunctionComponent<Props> = ({
  customDashboardId,
  size,
  widget,
  className,
  onUpdate,
  onDelete,
}) => {
  // Standard hooks
  const { t } = useFormatter();

  // Edition
  const [openEdit, setOpenEdit] = useState(false);
  const toggleDialog = () => setOpenEdit(prev => !prev);
  const initialValues = {
    widget_type: widget.widget_type,
    widget_config: widget.widget_config,
  };
  const onSubmit = async (input: WidgetInputWithoutLayout) => {
    const finalInput = {
      ...input,
      widget_layout: widget.widget_layout,
    };
    await updateCustomDashboardWidget(customDashboardId, widget.widget_id, finalInput).then((result) => {
      onUpdate(result.data);
    });
  };

  // Deletion
  const [openDelete, setOpenDelete] = useState(false);
  const handleOpenDelete = () => setOpenDelete(true);
  const handleCloseDelete = () => setOpenDelete(false);
  const submitDelete = () => {
    deleteCustomDashboardWidget(customDashboardId, widget.widget_id);
    if (onDelete) {
      onDelete(widget.widget_id);
    }
  };

  const entries: PopoverEntry[] = [
    {
      label: 'Update',
      action: toggleDialog,
    },
    {
      label: 'Delete',
      action: handleOpenDelete,
    },
  ];

  return (
    <div className={className}>
      <IconPopover size={size} entries={entries} />
      <WidgetForm
        open={openEdit}
        toggleDialog={toggleDialog}
        initialValues={initialValues}
        onSubmit={onSubmit}
        editing={true}
      />
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
