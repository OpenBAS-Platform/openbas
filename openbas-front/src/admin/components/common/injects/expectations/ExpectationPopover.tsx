import React, { FunctionComponent, useContext, useState } from 'react';
import { Button, Dialog as DialogMUI, DialogActions, DialogContent, DialogContentText, IconButton, Menu, MenuItem } from '@mui/material';
import { MoreVert } from '@mui/icons-material';
import Transition from '../../../../../components/common/Transition';
import { useFormatter } from '../../../../../components/i18n';
import ExpectationFormUpdate from './ExpectationFormUpdate';
import type { ExpectationInput } from './Expectation';
import Dialog from '../../../../../components/common/Dialog';
import { PermissionsContext } from '../../../components/Context';

interface ExpectationPopoverProps {
  index: number;
  expectation: ExpectationInput;
  handleUpdate: (data: ExpectationInput, idx: number) => void;
  handleDelete: (idx: number) => void;
}

const ExpectationPopover: FunctionComponent<ExpectationPopoverProps> = ({
  index,
  expectation,
  handleUpdate,
  handleDelete,
}) => {
  // Standard hooks
  const { t } = useFormatter();
  const { permissions } = useContext(PermissionsContext);

  const [anchorEl, setAnchorEl] = useState<Element | null>(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  // Popover
  const handlePopoverOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };
  const handlePopoverClose = () => setAnchorEl(null);

  // Edition
  const handleOpenEdit = () => {
    setOpenEdit(true);
    handlePopoverClose();
  };
  const handleCloseEdit = () => setOpenEdit(false);

  const onSubmitEdit = (data: ExpectationInput) => {
    handleUpdate(data, index);
    handleCloseEdit();
  };

  // Deletion
  const handleOpenDelete = () => {
    setOpenDelete(true);
    handlePopoverClose();
  };
  const handleCloseDelete = () => setOpenDelete(false);

  const onSubmitDelete = () => {
    handleDelete(index);
    handleCloseDelete();
  };

  return (
    <div>
      <IconButton
        onClick={(event) => handlePopoverOpen(event)}
        aria-haspopup="true"
        size="large"
        disabled={permissions.readOnly}
      >
        <MoreVert />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handlePopoverClose}
      >
        <MenuItem
          onClick={handleOpenEdit}
        >
          {t('Update')}
        </MenuItem>
        <MenuItem
          onClick={handleOpenDelete}
        >
          {t('Remove')}
        </MenuItem>
      </Menu>
      <DialogMUI
        open={openDelete}
        TransitionComponent={Transition}
        onClose={handleCloseDelete}
        PaperProps={{ elevation: 1 }}
      >
        <DialogContent>
          <DialogContentText>
            {t('Do you want to delete this expectation ?')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete}>
            {t('Cancel')}
          </Button>
          <Button color="secondary" onClick={onSubmitDelete}>
            {t('Delete')}
          </Button>
        </DialogActions>
      </DialogMUI>
      <Dialog
        open={openEdit}
        handleClose={handleCloseEdit}
        title={t('Update the expectation')}
      >
        <ExpectationFormUpdate
          initialValues={expectation}
          onSubmit={onSubmitEdit}
          handleClose={handleCloseEdit}
        />
      </Dialog>
    </div>
  );
};

export default ExpectationPopover;
