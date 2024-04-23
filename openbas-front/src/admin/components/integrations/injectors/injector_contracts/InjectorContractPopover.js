import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import * as R from 'ramda';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, IconButton, Menu, MenuItem } from '@mui/material';
import { MoreVert } from '@mui/icons-material';
import InjectorContractForm from './InjectorContractForm';
import { useFormatter } from '../../../../../components/i18n';
import { attackPatternsOptions } from '../../../../../utils/Option';
import Transition from '../../../../../components/common/Transition';
import { updateInjectorContract, deleteInjectorContract } from '../../../../../actions/InjectorContracts';

const InjectorContractPopover = ({ injector, injectorContract, killChainPhasesMap, attackPatternsMap }) => {
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
    return dispatch(updateInjectorContract(injectorContract.injector_contract_id, inputValues)).then(() => handleCloseEdit());
  };

  const handleOpenDelete = () => {
    setOpenDelete(true);
    handlePopoverClose();
  };
  const handleCloseDelete = () => setOpenDelete(false);
  const submitDelete = () => {
    dispatch(deleteInjectorContract(injectorContract.injector_contract_id));
    handleCloseDelete();
  };
  const injectorContractAttackPatterns = attackPatternsOptions(injectorContract.injector_contract_attack_patterns, attackPatternsMap, killChainPhasesMap);
  let initialValues = null;
  if (injector.injector_custom_contracts) {
    initialValues = R.pipe(
      R.pick([
        'injector_contract_name',
      ]),
      R.assoc('injector_contract_attack_patterns', injectorContractAttackPatterns),
    )(injectorContract);
  } else {
    initialValues = { injector_contract_attack_patterns: injectorContractAttackPatterns };
  }
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
        <MenuItem onClick={handleOpenDelete} disabled={!injector.injector_custom_contracts}>{t('Delete')}</MenuItem>
      </Menu>
      <Dialog
        open={openDelete}
        TransitionComponent={Transition}
        onClose={handleCloseDelete}
        PaperProps={{ elevation: 1 }}
      >
        <DialogContent>
          <DialogContentText>
            {t('Do you want to delete this inject contract?')}
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
        <DialogTitle>{t('Update the inject contract')}</DialogTitle>
        <DialogContent>
          <InjectorContractForm
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

export default InjectorContractPopover;
