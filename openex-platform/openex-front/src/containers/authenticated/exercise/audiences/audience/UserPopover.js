import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import Slide from '@material-ui/core/Slide';
import { MoreVert } from '@material-ui/icons';
import MenuItem from '@material-ui/core/MenuItem';
import { T } from '../../../../../components/I18n';
import { i18nRegister } from '../../../../../utils/Messages';
import { updateUser } from '../../../../../actions/User';
import { updateSubaudience } from '../../../../../actions/Subaudience';
import UserForm from './UserForm';
import { submitForm } from '../../../../../utils/Action';

i18nRegister({
  fr: {
    'Do you want to remove the user from this sub-audience?':
      "Souhaitez-vous supprimer l'utilisateur de cette sous-audience ?",
    'Update the user': "Modifier l'utilisateur",
    'Update the profile': "Modifier le profil de l'utilisateur",
    Profile: 'Profil',
  },
});

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

class UserPopover extends Component {
  constructor(props) {
    super(props);
    this.state = { anchorEl: null, openDelete: false, openEdit: false };
  }

  handlePopoverOpen(event) {
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
      .updateUser(this.props.user.user_id, data)
      .then(() => this.handleCloseEdit());
  }

  handleOpenDelete() {
    this.setState({ openDelete: true });
    this.handlePopoverClose();
  }

  handleCloseDelete() {
    this.setState({ openDelete: false });
  }

  submitDelete() {
    const userIds = R.pipe(
      R.values,
      R.filter((a) => a.user_id !== this.props.user.user_id),
      R.map((u) => u.user_id),
    )(this.props.subaudience.subaudience_users);
    this.props.updateSubaudience(
      this.props.exerciseId,
      this.props.audience.audience_id,
      this.props.subaudience.subaudience_id,
      { subaudience_users: userIds },
    );
    this.handleCloseDelete();
  }

  render() {
    const userIsUpdatable = R.propOr(true, 'user_can_update', this.props.user);
    const userIsDeletable = R.propOr(true, 'user_can_delete', this.props.user);
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
      R.assoc('user_organization', organizationName),
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
        'user_latitude',
        'user_longitude',
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
          <MenuItem
            onClick={this.handleOpenEdit.bind(this)}
            disabled={!userIsUpdatable}
          >
            <T>Edit</T>
          </MenuItem>
          <MenuItem
            onClick={this.handleOpenDelete.bind(this)}
            disabled={!userIsDeletable}
          >
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
              <T>Do you want to remove the user from this sub-audience?</T>
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
          open={this.state.openEdit}
          TransitionComponent={Transition}
          onClose={this.handleCloseEdit.bind(this)}
        >
          <DialogTitle>
            <T>Update the user</T>
          </DialogTitle>
          <DialogContent>
            <UserForm
              initialValues={initialValues}
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
      </div>
    );
  }
}

const select = (state) => ({
  organizations: state.referential.entities.organizations,
});

UserPopover.propTypes = {
  exerciseId: PropTypes.string,
  user: PropTypes.object,
  updateUser: PropTypes.func,
  updateSubaudience: PropTypes.func,
  audience: PropTypes.object,
  subaudience: PropTypes.object,
  organizations: PropTypes.object,
  children: PropTypes.node,
};

export default connect(select, {
  updateUser,
  updateSubaudience,
})(UserPopover);
