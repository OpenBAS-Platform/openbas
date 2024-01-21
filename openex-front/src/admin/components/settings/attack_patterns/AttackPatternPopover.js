import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import * as R from 'ramda';
import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, IconButton, Menu, MenuItem } from '@mui/material';
import { MoreVert } from '@mui/icons-material';
import { updateAttackPattern, deleteAttackPattern } from '../../../../actions/AttackPattern';
import AttackPatternForm from './AttackPatternForm';
import { useFormatter } from '../../../../components/i18n';
import { tagOptions } from '../../../../utils/Option';
import Transition from '../../../../components/common/Transition';

const AttackPatternPopover = ({ attackPattern, organizationsMap, tagsMap }) => {
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
      R.assoc(
        'attackPattern_organization',
        data.attackPattern_organization && data.attackPattern_organization.id
          ? data.attackPattern_organization.id
          : data.attackPattern_organization,
      ),
      R.assoc('attackPattern_tags', R.pluck('id', data.attackPattern_tags)),
    )(data);
    return dispatch(updateAttackPattern(attackPattern.attackPattern_id, inputValues)).then(() => handleCloseEdit());
  };

  const handleOpenDelete = () => {
    setOpenDelete(true);
    handlePopoverClose();
  };

  const handleCloseDelete = () => setOpenDelete(false);

  const submitDelete = () => {
    dispatch(deleteAttackPattern(attackPattern.attackPattern_id));
    handleCloseDelete();
  };

  const org = organizationsMap[attackPattern.attackPattern_organization];
  const attackPatternOrganization = org
    ? { id: org.organization_id, label: org.organization_name }
    : null;
  const attackPatternTags = tagOptions(attackPattern.attackPattern_tags, tagsMap);
  const initialValues = R.pipe(
    R.assoc('attackPattern_organization', attackPatternOrganization),
    R.assoc('attackPattern_tags', attackPatternTags),
    R.pick([
      'attackPattern_firstname',
      'attackPattern_lastname',
      'attackPattern_email',
      'attackPattern_organization',
      'attackPattern_phone',
      'attackPattern_phone2',
      'attackPattern_pgp_key',
      'attackPattern_tags',
      'attackPattern_admin',
    ]),
  )(attackPattern);
  return (
    <div>
      <IconButton onClick={handlePopoverOpen} aria-haspopup="true" size="large">
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
    </div>
  );
};

export default AttackPatternPopover;
