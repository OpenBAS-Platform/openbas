import { MoreVert } from '@mui/icons-material';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, IconButton, Menu, MenuItem } from '@mui/material';
import * as R from 'ramda';
import { useState } from 'react';
import { useDispatch } from 'react-redux';

import { deletePayload, duplicatePayload, updatePayload } from '../../../actions/Payload';
import Drawer from '../../../components/common/Drawer';
import Transition from '../../../components/common/Transition';
import { useFormatter } from '../../../components/i18n';
import { documentOptions, platformOptions } from '../../../utils/Option';
import PayloadForm from './PayloadForm';

const PayloadPopover = ({ payload, documentsMap, onUpdate, onDelete, onDuplicate, disableUpdate, disableDelete }) => {
  const [openDelete, setOpenDelete] = useState(false);
  const [openDuplicate, setOpenDuplicate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const dispatch = useDispatch();
  const { t } = useFormatter();
  const handlePopoverOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };
  const handlePopoverClose = () => setAnchorEl(null);
  const handleOpenEdit = () => {
    setOpenEdit(true);
    handlePopoverClose();
  };
  const handleCloseEdit = () => setOpenEdit(false);
  const onSubmitEdit = (data) => {
    function handleCleanupCommandValue(payload_cleanup_command) {
      return payload_cleanup_command === '' ? null : payload_cleanup_command;
    }
    function handleCleanupExecutorValue(payload_cleanup_executor, payload_cleanup_command) {
      if (payload_cleanup_executor !== '' && handleCleanupCommandValue(payload_cleanup_command) !== null) {
        return payload_cleanup_executor;
      }
      return null;
    }
    const inputValues = R.pipe(
      R.assoc('payload_platforms', R.pluck('id', data.payload_platforms)),
      R.assoc('payload_tags', data.payload_tags),
      R.assoc('payload_attack_patterns', data.payload_attack_patterns),
      R.assoc('executable_file', data.executable_file?.id),
      R.assoc('payload_cleanup_executor', handleCleanupExecutorValue(data.payload_cleanup_executor, data.payload_cleanup_command)),
      R.assoc('payload_cleanup_command', handleCleanupCommandValue(data.payload_cleanup_command)),
    )(data);
    return dispatch(updatePayload(payload.payload_id, inputValues)).then((result) => {
      if (onUpdate) {
        const payloadUpdated = result.entities.payloads[result.result];
        onUpdate(payloadUpdated);
      }
      handleCloseEdit();
    });
  };

  const handleOpenDelete = () => {
    setOpenDelete(true);
    handlePopoverClose();
  };
  const handleOpenDuplicate = () => {
    setOpenDuplicate(true);
    handlePopoverClose();
  };
  const handleCloseDelete = () => setOpenDelete(false);
  const handleCloseDuplicate = () => setOpenDuplicate(false);
  const submitDelete = () => {
    dispatch(deletePayload(payload.payload_id)).then(
      () => {
        if (onDelete) {
          onDelete(payload.payload_id);
        }
      },
    );
    handleCloseDelete();
  };
  const submitDuplicate = () => {
    return dispatch(duplicatePayload(payload.payload_id)).then((result) => {
      if (onDuplicate) {
        const payloadUpdated = result.entities.payloads[result.result];
        onDuplicate(payloadUpdated);
      }
      handleCloseDuplicate();
    });
  };
  const payloadPlatforms = platformOptions(payload.payload_platforms);
  const payloadExecutableFiles = documentOptions(payload.executable_file ? [payload.executable_file] : [], documentsMap);
  const initialValues = R.pipe(
    R.pick([
      'payload_name',
      'payload_description',
      'command_executor',
      'command_content',
      'dns_resolution_hostname',
      'payload_arguments',
      'payload_prerequisites',
      'file_drop_file',
      'payload_attack_patterns',
      'payload_tags',
      'executable_arch',
    ]),
    R.assoc('payload_platforms', payloadPlatforms),
    R.assoc('executable_file', R.head(payloadExecutableFiles)),
    R.assoc('payload_cleanup_executor', payload.payload_cleanup_executor === null ? '' : payload.payload_cleanup_executor),
    R.assoc('payload_cleanup_command', payload.payload_cleanup_command === null ? '' : payload.payload_cleanup_command),
  )(payload);
  return (
    <>
      <IconButton color="primary" onClick={handlePopoverOpen} aria-haspopup="true" size="large">
        <MoreVert />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handlePopoverClose}
      >
        <MenuItem onClick={handleOpenDuplicate}>{t('Duplicate')}</MenuItem>
        <MenuItem onClick={handleOpenEdit} disabled={disableUpdate}>{t('Update')}</MenuItem>
        <MenuItem onClick={handleOpenDelete} disabled={disableDelete}>{t('Delete')}</MenuItem>
      </Menu>
      <Dialog
        open={openDelete}
        TransitionComponent={Transition}
        onClose={handleCloseDelete}
        PaperProps={{ elevation: 1 }}
      >
        <DialogContent>
          <DialogContentText>
            {t('Do you want to delete this payload?')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete}>{t('Cancel')}</Button>
          <Button color="secondary" onClick={submitDelete}>
            {t('Delete')}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openDuplicate}
        TransitionComponent={Transition}
        onClose={handleCloseDuplicate}
        PaperProps={{ elevation: 1 }}
      >
        <DialogContent>
          <DialogContentText>
            {t('Do you want to duplicate this payload?')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDuplicate}>{t('Cancel')}</Button>
          <Button color="secondary" onClick={submitDuplicate}>
            {t('Duplicate')}
          </Button>
        </DialogActions>
      </Dialog>
      <Drawer
        open={openEdit}
        handleClose={handleCloseEdit}
        title={t('Update the payload')}
      >
        <PayloadForm
          initialValues={initialValues}
          editing={true}
          onSubmit={onSubmitEdit}
          handleClose={handleCloseEdit}
          type={payload.payload_type}
        />
      </Drawer>
    </>
  );
};

export default PayloadPopover;
