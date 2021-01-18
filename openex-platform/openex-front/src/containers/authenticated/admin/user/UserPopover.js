import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Slide from '@material-ui/core/Slide';
import { T } from '../../../../components/I18n';
import { i18nRegister } from '../../../../utils/Messages';
import * as Constants from '../../../../constants/ComponentTypes';
import { Popover } from '../../../../components/Popover';
import { Menu } from '../../../../components/Menu';
import { Icon } from '../../../../components/Icon';
import {
  MenuItemLink,
  MenuItemButton,
} from '../../../../components/menu/MenuItem';
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
      openPopover: false,
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
    return this.props.updateUser(
      this.props.user.user_id,
      R.assoc('user_admin', data.user_admin === true, data),
    );
  }

  submitFormEdit() {
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
      <Button
        key="cancel"
        label="Cancel"
        primary={true}
        onClick={this.handleCloseEdit.bind(this)}
      />,
      <Button
        key="update"
        label="Update"
        primary={true}
        onClick={this.submitFormEdit.bind(this)}
      />,
    ];
    const editPassword = [
      <Button
        key="cancel"
        label="Cancel"
        primary={true}
        onClick={this.handleCloseEditPassword.bind(this)}
      />,
      <Button
        key="update"
        label="Update"
        primary={true}
        onClick={this.submitFormEditPassword.bind(this)}
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
          onClose={this.handlePopoverClose.bind(this)}
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
          open={this.state.openDelete}
          TransitionComponent={Transition}
          onClose={this.handleCloseDelete.bind(this)}
        >
          <T>Do you want to delete this user?</T>
          <Button
              key="cancel"
              label="Cancel"
              primary={true}
              onClick={this.handleCloseDelete.bind(this)}
          />
          <Button
              key="delete"
              label="Delete"
              primary={true}
              onClick={this.submitDelete.bind(this)}
          />
        </Dialog>
        <Dialog
          title="Update the user"
          modal={false}
          open={this.state.openEdit}
          autoScrollBodyContent={true}
          onClose={this.handleCloseEdit.bind(this)}
          actions={editActions}
        >
          <UserForm
            initialValues={initialValues}
            editing={true}
            organizations={this.props.organizations}
            onSubmit={this.onSubmitEdit.bind(this)}
            onSubmitSuccess={this.handleCloseEdit.bind(this)}
          />
        </Dialog>
        <Dialog
          title="Update the user password"
          modal={false}
          open={this.state.openEditPassword}
          autoScrollBodyContent={true}
          onClose={this.handleCloseEditPassword.bind(this)}
          actions={editPassword}
        >
          <UserPasswordForm
            ref="userPasswordForm"
            onSubmit={this.onSubmitEditPassword.bind(this)}
            onSubmitSuccess={this.handleCloseEditPassword.bind(this)}
          />
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
