import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { T } from '../../../../components/I18n';
import { i18nRegister } from '../../../../utils/Messages';
import * as Constants from '../../../../constants/ComponentTypes';
import { Popover } from '../../../../components/Popover';
import { Menu } from '../../../../components/Menu';
import { Dialog } from '../../../../components/Dialog';
import { IconButton, FlatButton } from '../../../../components/Button';
import { Icon } from '../../../../components/Icon';
import {
  MenuItemLink,
  MenuItemButton,
} from '../../../../components/menu/MenuItem';
// eslint-disable-next-line import/no-cycle
import { updateUser, deleteUser } from '../../../../actions/User';
import UserForm from './UserForm';
import UserPasswordForm from './UserPasswordForm';

i18nRegister({
  fr: {
    'Do you want to delete this user?':
      'Souhaitez-vous supprimer cet utilisateur ?',
    'Update the user': "Mettre à jour l'utilisateur",
    'Update the user password':
      "Mettre à jour le mot de passe de l'utilisateur",
    'Modify password': 'Modifier le mot de passe',
  },
});

const style = {
  position: 'absolute',
  top: '7px',
  right: 0,
};

class UserPopover extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openDelete: false,
      openEdit: false,
      openEditPassword: false,
      openPopover: false,
    };
  }

  handlePopoverOpen(event) {
    event.stopPropagation();
    this.setState({ openPopover: true, anchorEl: event.currentTarget });
  }

  handlePopoverClose() {
    this.setState({ openPopover: false });
  }

  handleOpenEdit() {
    this.setState({ openEdit: true });
    this.handlePopoverClose();
  }

  handleCloseEdit() {
    this.setState({ openEdit: false });
  }

  onSubmitEdit(data) {
    return this.props.updateUser(
      this.props.user.user_id,
      R.assoc('user_admin', data.user_admin === true, data),
    );
  }

  submitFormEdit() {
    // eslint-disable-next-line react/no-string-refs
    this.refs.userForm.submit();
  }

  handleOpenEditPassword() {
    this.setState({ openEditPassword: true });
    this.handlePopoverClose();
  }

  handleCloseEditPassword() {
    this.setState({ openEditPassword: false });
  }

  onSubmitEditPassword(data) {
    return this.props.updateUser(this.props.user.user_id, {
      user_plain_password: data.user_plain_password,
    });
  }

  submitFormEditPassword() {
    // eslint-disable-next-line react/no-string-refs
    this.refs.userPasswordForm.submit();
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
    const editActions = [
      <FlatButton
        key="cancel"
        label="Cancel"
        primary={true}
        onClick={this.handleCloseEdit.bind(this)}
      />,
      <FlatButton
        key="update"
        label="Update"
        primary={true}
        onClick={this.submitFormEdit.bind(this)}
      />,
    ];
    const editPassword = [
      <FlatButton
        key="cancel"
        label="Cancel"
        primary={true}
        onClick={this.handleCloseEditPassword.bind(this)}
      />,
      <FlatButton
        key="update"
        label="Update"
        primary={true}
        onClick={this.submitFormEditPassword.bind(this)}
      />,
    ];
    const deleteActions = [
      <FlatButton
        key="cancel"
        label="Cancel"
        primary={true}
        onClick={this.handleCloseDelete.bind(this)}
      />,
      <FlatButton
        key="delete"
        label="Delete"
        primary={true}
        onClick={this.submitDelete.bind(this)}
      />,
    ];

    const organizationPath = [
      R.prop('user_organization', this.props.user),
      'organization_name',
    ];
    const organizationName = R.pathOr(
      '-',
      organizationPath,
      this.props.organizations,
    );
    const initialValues = R.pipe(
      R.assoc('user_organization', organizationName), // Reformat organization
      R.pick([
        'user_firstname',
        'user_lastname',
        'user_email',
        'user_email2',
        'user_organization',
        'user_phone',
        'user_phone2',
        'user_phone3',
        'user_pgp_key',
        'user_admin',
        'user_planificateur',
      ]),
    )(this.props.user);

    return (
      <div style={style}>
        <IconButton onClick={this.handlePopoverOpen.bind(this)}>
          <Icon name={Constants.ICON_NAME_NAVIGATION_MORE_VERT} />
        </IconButton>
        <Popover
          open={this.state.openPopover}
          anchorEl={this.state.anchorEl}
          onRequestClose={this.handlePopoverClose.bind(this)}
        >
          <Menu multiple={false}>
            <MenuItemLink
              label="Edit"
              onClick={this.handleOpenEdit.bind(this)}
            />
            <MenuItemLink
              label="Modify password"
              onClick={this.handleOpenEditPassword.bind(this)}
            />
            <MenuItemButton
              label="Delete"
              onClick={this.handleOpenDelete.bind(this)}
            />
          </Menu>
        </Popover>
        <Dialog
          title="Confirmation"
          modal={false}
          open={this.state.openDelete}
          onRequestClose={this.handleCloseDelete.bind(this)}
          actions={deleteActions}
        >
          <T>Do you want to delete this user?</T>
        </Dialog>
        <Dialog
          title="Update the user"
          modal={false}
          open={this.state.openEdit}
          autoScrollBodyContent={true}
          onRequestClose={this.handleCloseEdit.bind(this)}
          actions={editActions}
        >
          {/* eslint-disable */}
          <UserForm
            ref="userForm"
            initialValues={initialValues}
            editing={true}
            organizations={this.props.organizations}
            onSubmit={this.onSubmitEdit.bind(this)}
            onSubmitSuccess={this.handleCloseEdit.bind(this)}
          />
          {/* eslint-enable */}
        </Dialog>
        <Dialog
          title="Update the user password"
          modal={false}
          open={this.state.openEditPassword}
          autoScrollBodyContent={true}
          onRequestClose={this.handleCloseEditPassword.bind(this)}
          actions={editPassword}
        >
          {/* eslint-disable */}
          <UserPasswordForm
            ref="userPasswordForm"
            onSubmit={this.onSubmitEditPassword.bind(this)}
            onSubmitSuccess={this.handleCloseEditPassword.bind(this)}
          />
          {/* eslint-enable */}
        </Dialog>
      </div>
    );
  }
}

const select = (state) => ({
  organizations: state.referential.entities.organizations,
});

UserPopover.propTypes = {
  user: PropTypes.object,
  updateUser: PropTypes.func,
  deleteUser: PropTypes.func,
  organizations: PropTypes.object,
  children: PropTypes.node,
};

export default connect(select, { updateUser, deleteUser })(UserPopover);
