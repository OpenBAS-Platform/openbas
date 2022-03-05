import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import * as R from 'ramda';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Slide from '@mui/material/Slide';
import { MoreVert } from '@mui/icons-material';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import {
  updateUser,
  deleteUser,
  updateUserPassword,
} from '../../../../actions/User';
import UserForm from './UserForm';
import { useFormatter } from '../../../../components/i18n';
import UserPasswordForm from './UserPasswordForm';

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

const UserPopover = ({ user, organizations }) => {
  const [openDelete, setOpenDelete] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openEditPassword, setOpenEditPassword] = useState(false);
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
        'user_organization',
        data.user_organization && data.user_organization.id
          ? data.user_organization.id
          : data.user_organization,
      ),
      R.assoc('user_tags', R.pluck('id', data.user_tags)),
    )(data);
    dispatch(updateUser(user.user_id, inputValues))
      .then(() => handleCloseEdit());
  };

  const handleOpenEditPassword = () => {
    setOpenEditPassword(true);
    handlePopoverClose();
  };

  const handleCloseEditPassword = () => setOpenEditPassword(false);

  const onSubmitEditPassword = (data) => {
    dispatch(updateUserPassword(user.user_id, data.user_plain_password))
      .then(() => handleCloseEditPassword());
  };

  const handleOpenDelete = () => {
    setOpenDelete(true);
    handlePopoverClose();
  };

  const handleCloseDelete = () => setOpenDelete(false);

  const submitDelete = () => {
    dispatch(deleteUser(user.user_id));
    handleCloseDelete();
  };

  const org = user.organization;
  const userOrganization = org ? { id: org.organization_id, label: org.organization_name } : null;
  const userTags = user.tags.map((tag) => ({
    id: tag.tag_id,
    label: tag.tag_name,
    color: tag.tag_color,
  }));
  const initialValues = R.pipe(
    R.assoc('user_organization', userOrganization),
    R.assoc('user_tags', userTags),
    R.pick([
      'user_firstname',
      'user_lastname',
      'user_email',
      'user_organization',
      'user_phone',
      'user_phone2',
      'user_pgp_key',
      'user_tags',
      'user_admin',
    ]),
  )(user);
  return (
      <div>
        <IconButton onClick={handlePopoverOpen}
          aria-haspopup="true"
          size="large">
          <MoreVert />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handlePopoverClose}>
          <MenuItem onClick={handleOpenEdit}>
            {t('Update')}
          </MenuItem>
          <MenuItem onClick={handleOpenEditPassword}>
            {t('Update password')}
          </MenuItem>
          {user.user_email !== 'admin@openex.io' && (
            <MenuItem onClick={handleOpenDelete}>
              {t('Delete')}
            </MenuItem>
          )}
        </Menu>
        <Dialog
          open={openDelete}
          TransitionComponent={Transition}
          onClose={handleCloseDelete}
          PaperProps={{ elevation: 1 }}
        >
          <DialogContent>
            <DialogContentText>
              {t('Do you want to delete this user?')}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              color="secondary"
              onClick={handleCloseDelete}>
              {t('Cancel')}
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={submitDelete}>
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
          <DialogTitle>{t('Update the user')}</DialogTitle>
          <DialogContent>
            <UserForm
              initialValues={initialValues}
              editing={true}
              organizations={organizations}
              onSubmit={onSubmitEdit}
              handleClose={handleCloseEdit}
            />
          </DialogContent>
        </Dialog>
        <Dialog
          TransitionComponent={Transition}
          open={openEditPassword}
          onClose={handleCloseEditPassword}
          fullWidth={true}
          maxWidth="md"
          PaperProps={{ elevation: 1 }}>
          <DialogTitle>{t('Update the user password')}</DialogTitle>
          <DialogContent>
            <UserPasswordForm
              onSubmit={onSubmitEditPassword}
              handleClose={handleCloseEditPassword}
            />
          </DialogContent>
        </Dialog>
      </div>
  );
};

export default UserPopover;
