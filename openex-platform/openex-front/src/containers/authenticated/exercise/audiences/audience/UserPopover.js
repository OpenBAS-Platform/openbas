import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Dialog from '@material-ui/core/Dialog';
import { T } from '../../../../../components/I18n';
import { i18nRegister } from '../../../../../utils/Messages';
import * as Constants from '../../../../../constants/ComponentTypes';
import { Popover } from '../../../../../components/Popover';
import { Menu } from '../../../../../components/Menu';
import { Icon } from '../../../../../components/Icon';
import {
  MenuItemLink,
  MenuItemButton,
} from '../../../../../components/menu/MenuItem';
import Theme from '../../../../../components/Theme';
/* eslint-disable */
import { updateUser } from "../../../../../actions/User";
import { updateSubaudience } from "../../../../../actions/Subaudience";
/* eslint-enable */
import UserForm from './UserForm';

const style = {
  position: 'absolute',
  top: '7px',
  right: 0,
};

i18nRegister({
  fr: {
    'Do you want to remove the user from this sub-audience?':
      "Souhaitez-vous supprimer l'utilisateur de cette sous-audience ?",
    'Update the user': "Modifier l'utilisateur",
    'Update the profile': "Modifier le profil de l'utilisateur",
    Profile: 'Profil',
  },
});

class UserPopover extends Component {
  constructor(props) {
    super(props);
    this.state = { openDelete: false, openEdit: false, openPopover: false };
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
    return this.props.updateUser(this.props.user.user_id, data);
  }

  submitFormEdit() {
    this.refs.userForm.submit();
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
      userIds,
    );
    this.handleCloseDelete();
  }

  // eslint-disable-next-line class-methods-use-this
  switchColor(disabled) {
    if (disabled) {
      return Theme.palette.disabledColor;
    }
    return Theme.palette.textColor;
  }

  render() {
    const subaudienceIsUpdatable = R.propOr(
      true,
      'user_can_update',
      this.props.subaudience,
    );
    const subaudienceIsDeletable = R.propOr(
      true,
      'user_can_delete',
      this.props.subaudience,
    );
    const userIsUpdatable = R.propOr(true, 'user_can_update', this.props.user);
    const userIsDeletable = R.propOr(true, 'user_can_delete', this.props.user);

    const editActions = [
      <Button
        key="cancel"
        label="Cancel"
        primary={true}
        onClick={this.handleCloseEdit.bind(this)}
      />,
      subaudienceIsUpdatable ? (
        <Button
          key="update"
          label="Update"
          primary={true}
          onClick={this.submitFormEdit.bind(this)}
        />
      ) : (
        ''
      ),
    ];
    const deleteActions = [
      <Button
        key="cancel"
        label="Cancel"
        primary={true}
        onClick={this.handleCloseDelete.bind(this)}
      />,
      subaudienceIsDeletable ? (
        <Button
          key="delete"
          label="Delete"
          primary={true}
          onClick={this.submitDelete.bind(this)}
        />
      ) : (
        ''
      ),
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
      ]),
    )(this.props.user);

    return (
      <div style={style}>
        <IconButton onClick={this.handlePopoverOpen.bind(this)}>
          <Icon
            name={Constants.ICON_NAME_NAVIGATION_MORE_VERT}
            color={this.switchColor(
              !this.props.audience.audience_enabled
                || !this.props.subaudience.subaudience_enabled,
            )}
          />
        </IconButton>

        {userIsUpdatable || userIsDeletable ? (
          <Popover
            open={this.state.openPopover}
            anchorEl={this.state.anchorEl}
            onRequestClose={this.handlePopoverClose.bind(this)}
          >
            <Menu multiple={false}>
              {userIsUpdatable ? (
                <MenuItemLink
                  label="Edit"
                  onClick={this.handleOpenEdit.bind(this)}
                />
              ) : (
                ''
              )}
              {userIsDeletable ? (
                <MenuItemButton
                  label="Delete"
                  onClick={this.handleOpenDelete.bind(this)}
                />
              ) : (
                ''
              )}
            </Menu>
          </Popover>
        ) : (
          ''
        )}

        <Dialog
          title="Confirmation"
          modal={false}
          open={this.state.openDelete}
          onRequestClose={this.handleCloseDelete.bind(this)}
          actions={deleteActions}
        >
          <T>Do you want to remove the user from this sub-audience?</T>
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
            organizations={this.props.organizations}
            onSubmit={this.onSubmitEdit.bind(this)}
            onSubmitSuccess={this.handleCloseEdit.bind(this)}
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
