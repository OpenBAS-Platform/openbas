import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
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
import inject18n from '../../../../components/i18n';
import UserPasswordForm from './UserPasswordForm';
import { storeBrowser } from '../../../../actions/Schema';

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

class UserPopover extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openDelete: false,
      openEdit: false,
      openEditPassword: false,
    };
  }

  handlePopoverOpen(event) {
    event.stopPropagation();
    this.setState({ anchorEl: event.currentTarget });
  }

  handlePopoverClose() {
    this.setState({ anchorEl: null });
  }

  handleOpenEdit() {
    this.setState({ openEdit: true });
    this.handlePopoverClose();
  }

  handleCloseEdit() {
    this.setState({ openEdit: false });
  }

  onSubmitEdit(data) {
    const inputValues = R.pipe(
      R.assoc(
        'user_organization',
        data.user_organization && data.user_organization.id
          ? data.user_organization.id
          : data.user_organization,
      ),
      R.assoc('user_tags', R.pluck('id', data.user_tags)),
    )(data);
    return this.props
      .updateUser(this.props.user.user_id, inputValues)
      .then(() => this.handleCloseEdit());
  }

  handleOpenEditPassword() {
    this.setState({ openEditPassword: true });
    this.handlePopoverClose();
  }

  handleCloseEditPassword() {
    this.setState({ openEditPassword: false });
  }

  onSubmitEditPassword(data) {
    return this.props
      .updateUserPassword(this.props.user.user_id, data.user_plain_password)
      .then(() => this.handleCloseEditPassword());
  }

  handleOpenDelete() {
    this.setState({ openDelete: true });
    this.handlePopoverClose();
  }

  handleCloseDelete() {
    this.setState({ openDelete: false });
  }

  submitDelete() {
    this.props.deleteUser(this.props.user.user_id);
    this.handleCloseDelete();
  }

  render() {
    const { t, user, organizations } = this.props;
    const userOrganizationValue = user.getOrganization();
    const userOrganization = userOrganizationValue
      ? {
        id: userOrganizationValue.organization_id,
        label: userOrganizationValue.organization_name,
      }
      : null;
    const userTags = user.getTags().map((tag) => ({
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
        <IconButton
          onClick={this.handlePopoverOpen.bind(this)}
          aria-haspopup="true"
          size="large"
        >
          <MoreVert />
        </IconButton>
        <Menu
          anchorEl={this.state.anchorEl}
          open={Boolean(this.state.anchorEl)}
          onClose={this.handlePopoverClose.bind(this)}
        >
          <MenuItem onClick={this.handleOpenEdit.bind(this)}>
            {t('Update')}
          </MenuItem>
          <MenuItem onClick={this.handleOpenEditPassword.bind(this)}>
            {t('Update password')}
          </MenuItem>
          <MenuItem onClick={this.handleOpenDelete.bind(this)}>
            {t('Delete')}
          </MenuItem>
        </Menu>
        <Dialog
          open={this.state.openDelete}
          TransitionComponent={Transition}
          onClose={this.handleCloseDelete.bind(this)}
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
              onClick={this.handleCloseDelete.bind(this)}
            >
              {t('Cancel')}
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={this.submitDelete.bind(this)}
            >
              {t('Delete')}
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          TransitionComponent={Transition}
          open={this.state.openEdit}
          onClose={this.handleCloseEdit.bind(this)}
          fullWidth={true}
          maxWidth="md"
        >
          <DialogTitle>{t('Update the user')}</DialogTitle>
          <DialogContent>
            <UserForm
              initialValues={initialValues}
              editing={true}
              organizations={organizations}
              onSubmit={this.onSubmitEdit.bind(this)}
              handleClose={this.handleCloseEdit.bind(this)}
            />
          </DialogContent>
        </Dialog>
        <Dialog
          TransitionComponent={Transition}
          open={this.state.openEditPassword}
          onClose={this.handleCloseEditPassword.bind(this)}
          fullWidth={true}
          maxWidth="md"
        >
          <DialogTitle>{t('Update the user password')}</DialogTitle>
          <DialogContent>
            <UserPasswordForm
              onSubmit={this.onSubmitEditPassword.bind(this)}
              handleClose={this.handleCloseEditPassword.bind(this)}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }
}

UserPopover.propTypes = {
  t: PropTypes.func,
  user: PropTypes.object,
  updateUser: PropTypes.func,
  updateUserPassword: PropTypes.func,
  deleteUser: PropTypes.func,
  organizations: PropTypes.array,
};

const select = (state) => {
  const browser = storeBrowser(state);
  return { organizations: browser.getOrganizations() };
};

export default R.compose(
  connect(select, { updateUser, updateUserPassword, deleteUser }),
  inject18n,
)(UserPopover);
