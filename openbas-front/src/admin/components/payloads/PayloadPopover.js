import { MoreVert } from '@mui/icons-material';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, IconButton, Menu, MenuItem } from '@mui/material';
import * as R from 'ramda';
import { useContext, useState } from 'react';
import { useDispatch } from 'react-redux';

import {
  deletePayload,
  duplicatePayload,
  exportPayload,
  updatePayload,
} from '../../../actions/payloads/payload-actions';
import DialogDelete from '../../../components/common/DialogDelete';
import Drawer from '../../../components/common/Drawer';
import Transition from '../../../components/common/Transition';
import { useFormatter } from '../../../components/i18n';
import { AbilityContext, Can } from '../../../utils/permissions/PermissionsProvider.js';
import { ACTIONS, SUBJECTS } from '../../../utils/permissions/types.js';
import { download } from '../../../utils/utils.js';
import PayloadForm from './PayloadForm';

const PayloadPopover = ({ payload, onUpdate, onDelete, onDuplicate, disableUpdate, disableDelete }) => {
  const [openDuplicate, setOpenDuplicate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const dispatch = useDispatch();
  const { t } = useFormatter();
  const ability = useContext(AbilityContext);
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
      R.assoc('payload_platforms', data.payload_platforms),
      R.assoc('payload_tags', data.payload_tags),
      R.assoc('payload_attack_patterns', data.payload_attack_patterns),
      R.assoc('executable_file', data.executable_file),
      R.assoc('payload_cleanup_executor', handleCleanupExecutorValue(data.payload_cleanup_executor, data.payload_cleanup_command)),
      R.assoc('payload_cleanup_command', handleCleanupCommandValue(data.payload_cleanup_command)),
      R.assoc('payload_detection_remediations', Object.entries(data.remediations).filter(value => value[1]).map(value => ({
        detection_remediation_collector: value[0],
        detection_remediation_values: value[1].content,
        detection_remediation_id: value[1].remediationId,
      }))),
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
  const handleOpenDuplicate = () => {
    setOpenDuplicate(true);
    handlePopoverClose();
  };
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

  const handleExportJsonSingle = async () => {
    handlePopoverClose();
    const response = await exportPayload(payload.payload_id);

    const match = response.headers['content-disposition'].match(/filename="?([^"]+)"?/);
    const filename = match[1];
    download(response.data, filename, 'application/zip');
  };

  const initialValues = {
    payload_id: payload.payload_id,
    payload_name: payload.payload_name,
    payload_description: payload.payload_description,
    payload_type: payload.payload_type,
    command_executor: payload.command_executor,
    command_content: payload.command_content,
    dns_resolution_hostname: payload.dns_resolution_hostname,
    payload_arguments: payload.payload_arguments,
    payload_prerequisites: payload.payload_prerequisites,
    file_drop_file: payload.file_drop_file,
    payload_attack_patterns: payload.payload_attack_patterns,
    payload_tags: payload.payload_tags,
    payload_expectations: payload.payload_expectations ?? ['PREVENTION', 'DETECTION'],
    payload_execution_arch: payload.payload_execution_arch,
    payload_output_parsers: payload.payload_output_parsers,
    payload_platforms: payload.payload_platforms,
    executable_file: payload.executable_file,
    payload_cleanup_executor: payload.payload_cleanup_executor === null ? '' : payload.payload_cleanup_executor,
    payload_cleanup_command: payload.payload_cleanup_command === null ? '' : payload.payload_cleanup_command,
    remediations: {},
  };
  payload.payload_detection_remediations?.forEach((remediation) => {
    initialValues.remediations[remediation.detection_remediation_collector_type] = {
      content: remediation.detection_remediation_values,
      remediationId: remediation.detection_remediation_id,
    };
  });
  const hasUpdateCapability = ability.can(ACTIONS.MANAGE, SUBJECTS.PAYLOADS) || ability.can(ACTIONS.MANAGE, SUBJECTS.RESOURCE, payload.payload_id);
  const hasDeleteCapability = ability.can(ACTIONS.DELETE, SUBJECTS.PAYLOADS) || ability.can(ACTIONS.DELETE, SUBJECTS.RESOURCE, payload.payload_id);
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
        <Can I={ACTIONS.MANAGE} a={SUBJECTS.PAYLOADS}>
          <MenuItem onClick={handleOpenDuplicate}>{t('Duplicate')}</MenuItem>
        </Can>
        {hasUpdateCapability
          && <MenuItem onClick={handleOpenEdit} disabled={disableUpdate}>{t('Update')}</MenuItem>}
        <Can I={ACTIONS.ACCESS} a={SUBJECTS.PAYLOADS}>
          <MenuItem onClick={handleExportJsonSingle}>{t('Export')}</MenuItem>
        </Can>
        {hasDeleteCapability
          && <MenuItem onClick={handleOpenDelete} disabled={disableDelete}>{t('Delete')}</MenuItem>}
      </Menu>
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
