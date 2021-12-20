import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Slide from '@material-ui/core/Slide';
import { MoreVert } from '@material-ui/icons';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { T } from '../../../../components/I18n';
import { i18nRegister } from '../../../../utils/Messages';
import { updateUser, deleteUser, updateUserPassword } from '../../../../actions/User';
import UserForm from './UserForm';
import UserPasswordForm from './UserPasswordForm';
import { submitForm } from '../../../../utils/Action';

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
    return this.props
      .updateUser(
        this.props.user.user_id,
        R.assoc('user_admin', data.user_admin === true, data),
      )
      .then(() => this.handleCloseEdit());
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
    return this.props
      .updateUserPassword(this.props.user.user_id, data.user_plain_password)
      .then(() => this.handleCloseEditPassword());
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
      <div>
        <IconButton
          onClick={this.handlePopoverOpen.bind(this)}
          aria-haspopup="true"
        >
          <MoreVert />
        </IconButton>
        <Menu
          anchorEl={this.state.anchorEl}
          open={Boolean(this.state.anchorEl)}
          onClose={this.handlePopoverClose.bind(this)}
          style={{ marginTop: 50 }}
        >
          <MenuItem onClick={this.handleOpenEdit.bind(this)}>
            <T>Edit</T>
          </MenuItem>
          <MenuItem onClick={this.handleOpenEditPassword.bind(this)}>
            <T>Modify password</T>
          </MenuItem>
          <MenuItem onClick={this.handleOpenDelete.bind(this)}>
            <T>Delete</T>
          </MenuItem>
        </Menu>
        <Dialog
          open={this.state.openDelete}
          TransitionComponent={Transition}
          onClose={this.handleCloseDelete.bind(this)}
        >
          <DialogContent>
            <DialogContentText>
              <T>Do you want to delete this user?</T>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              onClick={this.handleCloseDelete.bind(this)}
            >
              <T>Cancel</T>
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={this.submitDelete.bind(this)}
            >
              <T>Delete</T>
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          TransitionComponent={Transition}
          open={this.state.openEdit}
          onClose={this.handleCloseEdit.bind(this)}
        >
          <DialogTitle>
            <T>Update the user</T>
          </DialogTitle>
          <DialogContent>
            <UserForm
              initialValues={initialValues}
              editing={true}
              organizations={this.props.organizations}
              onSubmit={this.onSubmitEdit.bind(this)}
            />
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              onClick={this.handleCloseEdit.bind(this)}
            >
              <T>Cancel</T>
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => submitForm('userForm')}
            >
              <T>Update</T>
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          TransitionComponent={Transition}
          open={this.state.openEditPassword}
          onClose={this.handleCloseEditPassword.bind(this)}
        >
          <DialogTitle>
            <T>Update the user password</T>
          </DialogTitle>
          <DialogContent>
            <UserPasswordForm onSubmit={this.onSubmitEditPassword.bind(this)} />
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              onClick={this.handleCloseEditPassword.bind(this)}
            >
              <T>Cancel</T>
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => submitForm('passwordForm')}
            >
              <T>Update</T>
            </Button>
          </DialogActions>
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
  updateUserPassword: PropTypes.func,
  deleteUser: PropTypes.func,
  organizations: PropTypes.object,
  children: PropTypes.node,
};

export default connect(select, { updateUser, updateUserPassword, deleteUser })(UserPopover);
