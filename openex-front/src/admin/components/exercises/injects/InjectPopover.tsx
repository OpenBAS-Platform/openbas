import React, { FunctionComponent, useContext, useState } from 'react';
import * as R from 'ramda';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@mui/material';
import { MoreVert } from '@mui/icons-material';
import InjectForm from './InjectForm';
import { useFormatter } from '../../../../components/i18n';
import { splitDuration } from '../../../../utils/Time';
import { tagOptions } from '../../../../utils/Option';
import Transition from '../../../../components/common/Transition';
import type { InjectInput, InjectStore } from '../../../../actions/injects/Inject';
import { InjectContext, PermissionsContext } from '../../components/Context';
import type { Contract, ExecutionTrace, Inject, InjectStatus, Tag } from '../../../../utils/api-types';
import { tryInject } from '../../../../actions/Inject';
import { useAppDispatch } from '../../../../utils/hooks';

interface Props {
  inject: InjectStore;
  injectTypesMap: Record<string, Contract>;
  tagsMap: Record<string, Tag>;
  setSelectedInject: (injectId: Inject['inject_id']) => void;
  isDisabled: boolean;
}

const InjectPopover: FunctionComponent<Props> = ({
  inject,
  injectTypesMap,
  tagsMap,
  setSelectedInject,
  isDisabled,
}) => {
  // Standard hooks
  const { t } = useFormatter();
  const dispatch = useAppDispatch();
  const { permissions } = useContext(PermissionsContext);
  const { onUpdateInject, onUpdateInjectTrigger, onUpdateInjectActivation, onInjectDone, onDeleteInject } = useContext(InjectContext);

  const [openDelete, setOpenDelete] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openTry, setOpenTry] = useState(false);
  const [openEnable, setOpenEnable] = useState(false);
  const [openDisable, setOpenDisable] = useState(false);
  const [openDone, setOpenDone] = useState(false);
  const [openResult, setOpenResult] = useState(false);
  const [openTrigger, setOpenTrigger] = useState(false);
  const [injectResult, setInjectResult] = useState<InjectStatus | null>(null);
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);

  const handlePopoverOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => setAnchorEl(null);

  const handleOpenEdit = () => {
    setOpenEdit(true);
    handlePopoverClose();
  };

  const handleCloseEdit = () => setOpenEdit(false);

  const onSubmitEdit = (data: InjectInput) => {
    const inputValues = R.pipe(
      R.assoc(
        'inject_depends_duration',
        data.inject_depends_duration_days * 3600 * 24
        + data.inject_depends_duration_hours * 3600
        + data.inject_depends_duration_minutes * 60,
      ),
      R.assoc('inject_contract', data.inject_contract.id),
      R.assoc('inject_tags', R.pluck('id', data.inject_tags)),
      R.dissoc('inject_depends_duration_days'),
      R.dissoc('inject_depends_duration_hours'),
      R.dissoc('inject_depends_duration_minutes'),
    )(data);
    return onUpdateInject(inject.inject_id, inputValues)
      .then(() => handleCloseEdit());
  };

  const handleOpenDelete = () => {
    setOpenDelete(true);
    handlePopoverClose();
  };

  const handleCloseDelete = () => setOpenDelete(false);

  const submitDelete = () => {
    onDeleteInject(inject.inject_id);
    handleCloseDelete();
  };

  const handleOpenTry = () => {
    setOpenTry(true);
    handlePopoverClose();
  };

  const handleCloseTry = () => setOpenTry(false);

  const handleCloseResult = () => {
    setOpenResult(false);
    setInjectResult(null);
  };

  const submitTry = () => {
    dispatch(tryInject(inject.inject_id)).then((payload: InjectStatus) => {
      setInjectResult(payload);
      setOpenResult(true);
    });
    handleCloseTry();
  };

  const handleOpenEnable = () => {
    setOpenEnable(true);
    handlePopoverClose();
  };

  const handleCloseEnable = () => setOpenEnable(false);

  const submitEnable = () => {
    onUpdateInjectActivation(inject.inject_id, { inject_enabled: true });
    handleCloseEnable();
  };

  const handleOpenDisable = () => {
    setOpenDisable(true);
    handlePopoverClose();
  };

  const handleCloseDisable = () => {
    setOpenDisable(false);
  };

  const submitDisable = () => {
    onUpdateInjectActivation(inject.inject_id, { inject_enabled: false });
    handleCloseDisable();
  };

  const handleOpenDone = () => {
    setOpenDone(true);
    handlePopoverClose();
  };

  const handleCloseDone = () => setOpenDone(false);

  const submitDone = () => {
    onInjectDone?.(inject.inject_id);
    handleCloseDone();
  };

  const handleOpenEditContent = () => {
    setSelectedInject(inject.inject_id);
    handlePopoverClose();
  };

  const handleOpenTrigger = () => {
    setOpenTrigger(true);
    handlePopoverClose();
  };

  const handleCloseTrigger = () => setOpenTrigger(false);

  const submitTrigger = () => {
    onUpdateInjectTrigger?.(inject.inject_id);
    handleCloseTrigger();
  };

  const injectTags = tagOptions(inject.inject_tags, tagsMap);
  const duration = splitDuration(inject.inject_depends_duration || 0);
  const initialValues = R.pipe(
    R.assoc('inject_tags', injectTags),
    R.pick([
      'inject_title',
      'inject_contract',
      'inject_description',
      'inject_tags',
      'inject_content',
      'inject_teams',
      'inject_all_teams',
      'inject_country',
      'inject_city',
    ]),
    R.assoc('inject_depends_duration_days', duration.days),
    R.assoc('inject_depends_duration_hours', duration.hours),
    R.assoc('inject_depends_duration_minutes', duration.minutes),
  )(inject);
  return (
    <div>
      <IconButton
        onClick={handlePopoverOpen}
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
          disabled={isDisabled}
        >
          {t('Update')}
        </MenuItem>
        <MenuItem
          onClick={handleOpenEditContent}
          disabled={isDisabled}
        >
          {t('Manage content')}
        </MenuItem>
        {!inject.inject_status && onInjectDone && (
          <MenuItem
            onClick={handleOpenDone}
            disabled={isDisabled}
          >
            {t('Mark as done')}
          </MenuItem>
        )}
        {inject.inject_type !== 'openex_manual' && onUpdateInjectTrigger && (
          <MenuItem
            onClick={handleOpenTrigger}
            disabled={isDisabled || permissions.isRunning}
          >
            {t('Trigger now')}
          </MenuItem>
        )}
        {inject.inject_type !== 'openex_manual' && (
          <MenuItem
            onClick={handleOpenTry}
            disabled={isDisabled}
          >
            {t('Try the inject')}
          </MenuItem>
        )}
        {inject.inject_enabled ? (
          <MenuItem
            onClick={handleOpenDisable}
            disabled={isDisabled}
          >
            {t('Disable')}
          </MenuItem>
        ) : (
          <MenuItem
            onClick={handleOpenEnable}
            disabled={isDisabled}
          >
            {t('Enable')}
          </MenuItem>
        )}
        <MenuItem onClick={handleOpenDelete}>
          {t('Delete')}
        </MenuItem>
      </Menu>
      <Dialog
        open={openDelete}
        TransitionComponent={Transition}
        onClose={handleCloseDelete}
        PaperProps={{ elevation: 1 }}
      >
        <DialogContent>
          <DialogContentText>
            {t('Do you want to delete this inject?')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete}>
            {t('Cancel')}
          </Button>
          <Button color="secondary" onClick={submitDelete}>
            {t('Delete')}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        TransitionComponent={Transition}
        open={openEdit}
        onClose={handleCloseEdit}
        fullWidth={true}
        maxWidth="md"
        PaperProps={{ elevation: 1 }}
      >
        <DialogTitle>{t('Update the inject')}</DialogTitle>
        <DialogContent>
          <InjectForm
            initialValues={initialValues}
            editing
            injectTypesMap={injectTypesMap}
            onSubmit={onSubmitEdit}
            handleClose={handleCloseEdit}
          />
        </DialogContent>
      </Dialog>
      <Dialog
        TransitionComponent={Transition}
        open={openTry}
        onClose={handleCloseTry}
        PaperProps={{ elevation: 1 }}
      >
        <DialogContent>
          <DialogContentText>
            <p>{t('Do you want to try this inject?')}</p>
            <Alert severity="info">
              {t('The inject will only be sent to you.')}
            </Alert>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTry}>
            {t('Cancel')}
          </Button>
          <Button color="secondary" onClick={submitTry}>
            {t('Try')}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        TransitionComponent={Transition}
        open={openEnable}
        onClose={handleCloseEnable}
        PaperProps={{ elevation: 1 }}
      >
        <DialogContent>
          <DialogContentText>
            {t('Do you want to enable this inject?')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEnable}>
            {t('Cancel')}
          </Button>
          <Button color="secondary" onClick={submitEnable}>
            {t('Enable')}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        TransitionComponent={Transition}
        open={openDisable}
        onClose={handleCloseDisable}
        PaperProps={{ elevation: 1 }}
      >
        <DialogContent>
          <DialogContentText>
            {t('Do you want to disable this inject?')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDisable}>
            {t('Cancel')}
          </Button>
          <Button color="secondary" onClick={submitDisable}>
            {t('Disable')}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        TransitionComponent={Transition}
        open={openDone}
        onClose={handleCloseDone}
        PaperProps={{ elevation: 1 }}
      >
        <DialogContent>
          <DialogContentText>
            {t('Do you want to mark this inject as done?')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDone}>
            {t('Cancel')}
          </Button>
          <Button color="secondary" onClick={submitDone}>
            {t('Mark')}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        TransitionComponent={Transition}
        open={openTrigger}
        onClose={handleCloseTrigger}
        PaperProps={{ elevation: 1 }}
      >
        <DialogContent>
          <DialogContentText>
            {t('Do you want to trigger this inject now?')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTrigger}>
            {t('Cancel')}
          </Button>
          <Button color="secondary" onClick={submitTrigger}>
            {t('Trigger')}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openResult}
        TransitionComponent={Transition}
        onClose={handleCloseResult}
        fullWidth
        maxWidth="md"
        PaperProps={{ elevation: 1 }}
      >
        <DialogContent>
          {/* TODO: selectable={false} */}
          <Table size="small">
            {/* TODO: displayRowCheckbox={false} */}
            <TableBody>
              {injectResult?.status_reporting
                && Object.entries(injectResult.status_reporting).map(
                  ([key, value]) => {
                    if (key === 'execution_traces') {
                      return (
                        <TableRow key={key}>
                          <TableCell>{key}</TableCell>
                          <TableCell>
                            {/* TODO: selectable={false} */}
                            <Table size="small" key={key}>
                              {/* TODO: displayRowCheckbox={false} */}
                              <TableBody>
                                <>
                                  {value?.map((trace: ExecutionTrace) => (
                                    <TableRow key={trace.trace_identifier}>
                                      <TableCell>
                                        {trace.trace_message}
                                      </TableCell>
                                      <TableCell>
                                        {trace.trace_status}
                                      </TableCell>
                                      <TableCell>{trace.trace_time}</TableCell>
                                    </TableRow>
                                  ))}
                                </>
                              </TableBody>
                            </Table>
                          </TableCell>
                        </TableRow>
                      );
                    }
                    return (
                      <TableRow key={key}>
                        <TableCell>{key}</TableCell>
                        <TableCell>{value}</TableCell>
                      </TableRow>
                    );
                  },
                )}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseResult}>
            {t('Close')}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default InjectPopover;
