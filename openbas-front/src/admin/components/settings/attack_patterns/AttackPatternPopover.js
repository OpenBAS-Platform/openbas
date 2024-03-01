import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import * as R from 'ramda';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, IconButton, Menu, MenuItem } from '@mui/material';
import { MoreVert } from '@mui/icons-material';
import { updateAttackPattern, deleteAttackPattern } from '../../../../actions/AttackPattern';
import AttackPatternForm from './AttackPatternForm';
import { useFormatter } from '../../../../components/i18n';
import { killChainPhasesOptions } from '../../../../utils/Option';
import Transition from '../../../../components/common/Transition';

const AttackPatternPopover = ({ attackPattern, killChainPhasesMap }) => {
  const [openDelete, setOpenDelete] = useState(false);
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
    const inputValues = R.pipe(
      R.assoc('attack_pattern_kill_chain_phases', R.pluck('id', data.attack_pattern_kill_chain_phases)),
    )(data);
    return dispatch(updateAttackPattern(attackPattern.attack_pattern_id, inputValues)).then(() => handleCloseEdit());
  };

  const handleOpenDelete = () => {
    setOpenDelete(true);
    handlePopoverClose();
  };
  const handleCloseDelete = () => setOpenDelete(false);
  const submitDelete = () => {
    dispatch(deleteAttackPattern(attackPattern.attack_pattern_id));
    handleCloseDelete();
  };
  const attackPatternKillChainPhases = killChainPhasesOptions(attackPattern.attack_pattern_kill_chain_phases, killChainPhasesMap);
  const initialValues = R.pipe(
    R.assoc('attack_pattern_kill_chain_phases', attackPatternKillChainPhases),
    R.pick([
      'attack_pattern_external_id',
      'attack_pattern_name',
      'attack_pattern_description',
    ]),
  )(attackPattern);
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
        <MenuItem onClick={handleOpenEdit}>{t('Update')}</MenuItem>
        <MenuItem onClick={handleOpenDelete}>{t('Delete')}</MenuItem>
      </Menu>
      <Dialog
        open={openDelete}
        TransitionComponent={Transition}
        onClose={handleCloseDelete}
        PaperProps={{ elevation: 1 }}
      >
        <DialogContent>
          <DialogContentText>
            {t('Do you want to delete this attack pattern?')}
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
        TransitionComponent={Transition}
        open={openEdit}
        onClose={handleCloseEdit}
        fullWidth={true}
        maxWidth="md"
        PaperProps={{ elevation: 1 }}
      >
        <DialogTitle>{t('Update the attack pattern')}</DialogTitle>
        <DialogContent>
          <AttackPatternForm
            initialValues={initialValues}
            editing={true}
            onSubmit={onSubmitEdit}
            handleClose={handleCloseEdit}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AttackPatternPopover;
