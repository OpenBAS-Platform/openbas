import { Button, Dialog, DialogActions, DialogContent, DialogContentText } from '@mui/material';
import * as R from 'ramda';
import { useState } from 'react';
import { useDispatch } from 'react-redux';

import { deletePayload, duplicatePayload, exportPayloads, updatePayload } from '../../../actions/payloads/payload-actions';
import ButtonPopover from '../../../components/common/ButtonPopover.js';
import DialogDelete from '../../../components/common/DialogDelete';
import Drawer from '../../../components/common/Drawer';
import Transition from '../../../components/common/Transition';
import { useFormatter } from '../../../components/i18n';
import { documentOptions } from '../../../utils/Option';
import { download } from '../../../utils/utils.js';
import PayloadForm from './PayloadForm';

const PayloadPopover = ({ inline = false, payload, documentsMap, onUpdate, onDelete, onDuplicate, disableUpdate, disableDelete }) => {
  const [openDuplicate, setOpenDuplicate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const dispatch = useDispatch();
  const { t } = useFormatter();
  const handleOpenEdit = () => setOpenEdit(true);
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
      R.assoc('payload_platforms', data.payload_platforms),
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

  // Deletion
  const [deletion, setDeletion] = useState(false);
  const handleOpenDelete = () => setDeletion(true);
  const handleCloseDelete = () => setDeletion(false);
  const submitDelete = () => {
    dispatch(deletePayload(payload.payload_id)).then(() => {
      handleCloseDelete();
      if (onDelete) onDelete(payload.payload_id);
    });
  };

  // Duplicate
  const handleOpenDuplicate = () => setOpenDuplicate(true);
  const handleCloseDuplicate = () => setOpenDuplicate(false);
  const submitDuplicate = () => {
    return dispatch(duplicatePayload(payload.payload_id)).then((result) => {
      if (onDuplicate) {
        const payloadUpdated = result.entities.payloads[result.result];
        onDuplicate(payloadUpdated);
      }
      handleCloseDuplicate();
    });
  };

  const handleExportJsonSingle = () => {
    const exportData = {
      payloads: [
        { payload_id: payload.payload_id },
      ],
    };
    exportPayloads(exportData).then((result) => {
      const contentDisposition = result.headers['content-disposition'];
      const match = contentDisposition.match(/filename\s*=\s*(.*)/i);
      const filename = match[1];
      download(result.data, filename, result.headers['content-type']);
    });
  };

  const payloadExecutableFiles = documentOptions(payload.executable_file ? [payload.executable_file] : [], documentsMap);
  const initialValues = R.pipe(
    R.pick([
      'payload_name',
      'payload_description',
      'payload_type',
      'command_executor',
      'command_content',
      'dns_resolution_hostname',
      'payload_arguments',
      'payload_prerequisites',
      'file_drop_file',
      'payload_attack_patterns',
      'payload_tags',
      'payload_execution_arch',
      'payload_output_parsers',
      'payload_platforms',
    ]),
    R.assoc('executable_file', R.head(payloadExecutableFiles)),
    R.assoc('payload_cleanup_executor', payload.payload_cleanup_executor === null ? '' : payload.payload_cleanup_executor),
    R.assoc('payload_cleanup_command', payload.payload_cleanup_command === null ? '' : payload.payload_cleanup_command),
  )(payload);

  // Button Popover
  const entries = [];
  if (handleOpenDuplicate) entries.push({
    label: 'Duplicate',
    action: () => handleOpenDuplicate(),
  });
  if (handleOpenEdit) entries.push({
    label: 'Update',
    action: () => handleOpenEdit(),
    disabled: disableUpdate,
  });
  if (handleExportJsonSingle) entries.push({
    label: 'Export',
    action: () => handleExportJsonSingle(),
  });
  if (handleOpenDelete) entries.push({
    label: 'Delete',
    action: () => handleOpenDelete(),
    disabled: disableDelete,
  });

  return (
    <>
      <ButtonPopover entries={entries} variant={inline ? 'icon' : 'toggle'} />
      <DialogDelete
        open={deletion}
        handleClose={handleCloseDelete}
        handleSubmit={submitDelete}
        text={`${t('Do you want to delete this payload: ')} ${payload.payload_name} ?`}
      />
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
        <PayloadForm onSubmit={onSubmitEdit} handleClose={handleCloseEdit} editing initialValues={initialValues} />
      </Drawer>
    </>
  );
};

export default PayloadPopover;
