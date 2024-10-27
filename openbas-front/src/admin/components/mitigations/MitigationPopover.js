import { MoreVert } from '@mui/icons-material';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, IconButton, Menu, MenuItem } from '@mui/material';
import * as R from 'ramda';
import { useState } from 'react';
import { useDispatch } from 'react-redux';

import { deleteMitigation, updateMitigation } from '../../../actions/Mitigation';
import Drawer from '../../../components/common/Drawer';
import Transition from '../../../components/common/Transition';
import { useFormatter } from '../../../components/i18n';
import { attackPatternOptions } from '../../../utils/Option';
import MitigationForm from './MitigationForm';

const MitigationPopover = ({ mitigation, attackPatternsMap, killChainPhasesMap, onUpdate, onDelete }) => {
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
      R.assoc('mitigation_attack_patterns', R.pluck('id', data.mitigation_attack_patterns)),
    )(data);
    return dispatch(updateMitigation(mitigation.mitigation_id, inputValues)).then((result) => {
      if (onUpdate) {
        const mitigationUpdated = result.entities.mitigations[result.result];
        onUpdate(mitigationUpdated);
      }
      handleCloseEdit();
    });
  };

  const handleOpenDelete = () => {
    setOpenDelete(true);
    handlePopoverClose();
  };
  const handleCloseDelete = () => setOpenDelete(false);
  const submitDelete = () => {
    dispatch(deleteMitigation(mitigation.mitigation_id)).then(
      () => {
        if (onDelete) {
          onDelete(mitigation.mitigation_id);
        }
      },
    );
    handleCloseDelete();
  };
  const mitigationAttackPatterns = attackPatternOptions(mitigation.mitigation_attack_patterns, attackPatternsMap, killChainPhasesMap);
  const initialValues = R.pipe(
    R.pick([
      'mitigation_external_id',
      'mitigation_name',
      'mitigation_description',
    ]),
    R.assoc('mitigation_attack_patterns', mitigationAttackPatterns),
  )(mitigation);
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
            {t('Do you want to delete this mitigation?')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete}>{t('Cancel')}</Button>
          <Button color="secondary" onClick={submitDelete}>
            {t('Delete')}
          </Button>
        </DialogActions>
      </Dialog>
      <Drawer
        open={openEdit}
        handleClose={handleCloseEdit}
        title={t('Update the mitigation')}
      >
        <MitigationForm
          initialValues={initialValues}
          editing={true}
          onSubmit={onSubmitEdit}
          handleClose={handleCloseEdit}
        />
      </Drawer>
    </>
  );
};

export default MitigationPopover;
