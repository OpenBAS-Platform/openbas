import React, { FunctionComponent, useContext, useEffect, useState } from 'react';
import { MoreVert } from '@mui/icons-material';
import { Alert, Dialog, IconButton, Menu, MenuItem, SnackbarCloseReason } from '@mui/material';
import type { InjectTestStatus } from '../../../utils/api-types';
import { useFormatter } from '../../../components/i18n';
import { deleteInjectTest } from '../../../actions/inject_test/inject-test-actions';
import { testInject } from '../../../actions/injects/inject-action';
import { PermissionsContext } from '../common/Context';
import DialogDelete from '../../../components/common/DialogDelete';
import DialogTest from '../../../components/common/DialogTest';

interface Props {
  injectTestStatus: InjectTestStatus;
  onTest?: (result: InjectTestStatus) => void;
  onDelete?: (result: string) => void;
}

const InjectTestPopover: FunctionComponent<Props> = ({
  injectTestStatus,
  onDelete,
  onTest,
}) => {
  // Standard hooks
  const { t } = useFormatter();
  const { permissions } = useContext(PermissionsContext);

  const [anchorEl, setAnchorEl] = useState<Element | null>(null);
  const [openDelete, setOpenDelete] = useState(false);
  const [openTest, setOpenTest] = useState(false);
  const [_injectTestResult, setInjectTestResult] = useState<InjectTestStatus | null>(null);
  const [openDialog, setOpenDialog] = React.useState<boolean>(false);
  const handleCloseDialog = (
    event?: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenDialog(false);
  };

  const handlePopoverOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };
  const handlePopoverClose = () => setAnchorEl(null);

  const handleOpenDelete = () => {
    setOpenDelete(true);
    handlePopoverClose();
  };
  const handleCloseDelete = () => setOpenDelete(false);
  const submitDelete = () => {
    deleteInjectTest(injectTestStatus.status_id);
    if (onDelete) {
      onDelete(injectTestStatus.status_id!);
    }
    handleCloseDelete();
  };

  const handleOpenTest = () => {
    setOpenTest(true);
    handlePopoverClose();
  };

  const handleCloseTest = () => {
    setOpenTest(false);
    setInjectTestResult(null);
  };

  useEffect(() => {
    if (openDialog) {
      setTimeout(() => {
        handleCloseDialog();
      }, 6000);
    }
  }, [openDialog]);

  const submitTest = () => {
    testInject(injectTestStatus.inject_id!).then((result: { data: InjectTestStatus }) => {
      onTest?.(result.data);
      setOpenDialog(true);
      return result;
    });
    handleCloseTest();
  };

  return (
    <>
      <Dialog open={openDialog}
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: 'transparent',
            },
          },
        }}
        PaperProps={{
          sx: {
            position: 'fixed',
            top: '20px',
            left: '660px',
            margin: 0,
          },
        }}
      >
        <Alert
          onClose={handleCloseDialog}
          severity="success"
          sx={{ width: '100%' }}
        >
          {t('Inject test has been sent')}
        </Alert>
      </Dialog>
      <IconButton
        onClick={handlePopoverOpen}
        aria-haspopup="true"
        size="large"
        color="primary"
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
          onClick={handleOpenTest}
        >
          {t('Replay test')}
        </MenuItem>
        <MenuItem onClick={handleOpenDelete}>
          {t('Delete')}
        </MenuItem>
      </Menu>
      <DialogDelete
        open={openDelete}
        handleClose={handleCloseDelete}
        handleSubmit={submitDelete}
        text={t('Do you want to delete this test?')}
      />
      <DialogTest
        open={openTest}
        handleClose={handleCloseTest}
        handleSubmit={submitTest}
        text={t('Do you want to replay this test?')}
      />
    </>
  );
};

export default InjectTestPopover;
