import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Button from '@material-ui/core/Button';
import Slide from '@material-ui/core/Slide';
import { T } from '../../../../components/I18n';
import { i18nRegister } from '../../../../utils/Messages';
import * as Constants from '../../../../constants/ComponentTypes';
import { Popover } from '../../../../components/Popover';
import { Menu } from '../../../../components/Menu';
import { Dialog, DialogTitleElement } from '../../../../components/Dialog';
import { Icon } from '../../../../components/Icon';
import {
  MenuItemLink,
  MenuItemButton,
} from '../../../../components/menu/MenuItem';
import { SimpleTextField } from '../../../../components/SimpleTextField';
import { Checkbox } from '../../../../components/Checkbox';
import { Chip } from '../../../../components/Chip';
import { Avatar } from '../../../../components/Avatar';
import { List } from '../../../../components/List';
import { MainSmallListItem } from '../../../../components/list/ListItem';
import {
  fetchGroup,
  updateGroup,
  deleteGroup,
} from '../../../../actions/Group';
import { addGrant, deleteGrant } from '../../../../actions/Grant';
import GroupForm from './GroupForm';

i18nRegister({
  fr: {
    'Manage users': 'Gérer les utilisateurs',
    'Manage grants': 'Gérer les permissions',
    'Do you want to delete this group?': 'Souhaitez-vous supprimer ce groupe ?',
    Exercise: 'Exercice',
    Planner: 'Planificateur',
    Observer: 'Observateur',
    'Update the group': 'Mettre à jour le groupe',
    'Search for a user': 'Rechercher un utilisateur',
    'Read/Write': 'Lecture/Ecriture',
    'Read only': 'Lecture seule',
  },
});

const styles = {
  main: {
    position: 'absolute',
    top: '7px',
    right: 0,
  },
  name: {
    float: 'left',
    width: '30%',
    padding: '5px 0 0 0',
  },
  mail: {
    float: 'left',
    width: '40%',
    padding: '5px 0 0 0',
  },
  org: {
    float: 'left',
    padding: '5px 0 0 0',
  },
};

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

class GroupPopover extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openDelete: false,
      openEdit: false,
      openUsers: false,
      openGrants: false,
      openPopover: false,
      searchTerm: '',
      usersIds: this.props.groupUsersIds,
      grantsToAdd: [],
      grantsToRemove: [],
    };
  }

  handlePopoverOpen(event) {
    event.preventDefault();
    this.setState({
      openPopover: true,
      anchorEl: event.currentTarget,
    });
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
    return this.props.updateGroup(this.props.group.group_id, data);
  }

  submitFormEdit() {
    this.refs.groupForm.submit();
  }

  handleOpenUsers() {
    this.setState({ openUsers: true, usersIds: this.props.groupUsersIds });
    this.handlePopoverClose();
  }

  handleSearchUsers(event) {
    this.setState({ searchTerm: event.target.value });
  }

  addUser(userId) {
    this.setState({ usersIds: R.append(userId, this.state.usersIds) });
  }

  removeUser(userId) {
    this.setState({
      usersIds: R.filter((u) => u !== userId, this.state.usersIds),
    });
  }

  handleCloseUsers() {
    this.setState({ openUsers: false, searchTerm: '' });
  }

  submitAddUsers() {
    this.props.updateGroup(this.props.group.group_id, {
      group_users: this.state.usersIds,
    });
    this.handleCloseUsers();
  }

  handleOpenGrants() {
    this.setState({ openGrants: true });
    this.handlePopoverClose();
  }

  handleCloseGrants() {
    this.setState({ openGrants: false });
  }

  handleGrantCheck(exerciseId, grantId, grantName, event, isChecked) {
    // the grant already exists
    if (grantId !== null && isChecked) {
      return;
      // the grant does not exist yet
    }
    if (isChecked) {
      const { grantsToAdd } = this.state;
      grantsToAdd.push({ exercise_id: exerciseId, grant_name: grantName });
      this.setState({ grantsToAdd });
    }
    // the grand does not exist
    if (!isChecked && grantId !== null) {
      const { grantsToRemove } = this.state;
      grantsToRemove.push({ exercise_id: exerciseId, grant_id: grantId });
      this.setState({ grantsToRemove });
    }
  }

  submitGrants() {
    const { grantsToAdd } = this.state;
    const internalAddGrant = (n) => this.props
      .addGrant(this.props.group.group_id, {
        grant_name: n.grant_name,
        grant_exercise: n.exercise_id,
      })
      .then(() => {
        this.props.fetchGroup(this.props.group.group_id);
      });
    R.forEach(internalAddGrant, grantsToAdd);
    this.setState({ grantsToAdd: [] });

    const { grantsToRemove } = this.state;
    // eslint-disable-next-line max-len
    const internalDeleteGrant = (n) => this.props.deleteGrant(this.props.group.group_id, n.grant_id).then(() => {
      this.props.fetchGroup(this.props.group.group_id);
    });
    R.forEach(internalDeleteGrant, grantsToRemove);
    this.setState({ grantsToRemove: [] });

    this.handleCloseGrants();
  }

  handleOpenDelete() {
    this.setState({ openDelete: true });
    this.handlePopoverClose();
  }

  handleCloseDelete() {
    this.setState({ openDelete: false });
  }

  submitDelete() {
    this.props.deleteGroup(this.props.group.group_id);
    this.handleCloseDelete();
  }

  render() {
    const grantsActions = [
      <Button
        key="cancel"
        label="Cancel"
        primary={true}
        onClick={this.handleCloseGrants.bind(this)}
      />,
      <Button
        key="update"
        label="Update"
        primary={true}
        onClick={this.submitGrants.bind(this)}
      />,
    ];
    const usersActions = [
      <Button
        key="cancel"
        label="Cancel"
        primary={true}
        onClick={this.handleCloseUsers.bind(this)}
      />,
      <Button
        key="update"
        label="Update"
        primary={true}
        onClick={this.submitAddUsers.bind(this)}
      />,
    ];
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
    const deleteActions = [
      <Button
        key="cancel"
        label="Cancel"
        primary={true}
        onClick={this.handleCloseDelete.bind(this)}
      />,
      <Button
        key="delete"
        label="Delete"
        primary={true}
        onClick={this.submitDelete.bind(this)}
      />,
    ];

    const initialValues = R.pick(['group_name'], this.props.group); // Pickup only needed fields

    // region filter users by active keyword
    const keyword = this.state.searchTerm;
    const filterByKeyword = (n) => keyword === ''
      || n.user_email.toLowerCase().indexOf(keyword.toLowerCase()) !== -1
      || n.user_firstname.toLowerCase().indexOf(keyword.toLowerCase()) !== -1
      || n.user_lastname.toLowerCase().indexOf(keyword.toLowerCase()) !== -1;
    const filteredUsers = R.filter(filterByKeyword, R.values(this.props.users));
    // endregion

    return (
      <div style={styles.main}>
        <Button onClick={this.handlePopoverOpen.bind(this)}>
          <Icon name={Constants.ICON_NAME_NAVIGATION_MORE_VERT} />
        </Button>
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
              label="Manage users"
              onClick={this.handleOpenUsers.bind(this)}
            />
            <MenuItemLink
              label="Manage grants"
              onClick={this.handleOpenGrants.bind(this)}
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
          <T>Do you want to delete this group?</T>
        </Dialog>
        <Dialog
          title="Update the group"
          modal={false}
          open={this.state.openEdit}
          onRequestClose={this.handleCloseEdit.bind(this)}
          actions={editActions}
        >
          {/* eslint-disable */}
          <GroupForm
            ref="groupForm"
            initialValues={initialValues}
            onSubmit={this.onSubmitEdit.bind(this)}
            onSubmitSuccess={this.handleCloseEdit.bind(this)}
          />
          {/* eslint-enable */}
        </Dialog>
        <DialogTitleElement
          title={
            <SimpleTextField
              name="keyword"
              fullWidth={true}
              type="text"
              hintText="Search for a user"
              onChange={this.handleSearchUsers.bind(this)}
              styletype={Constants.FIELD_TYPE_INTITLE}
            />
          }
          modal={false}
          open={this.state.openUsers}
          onRequestClose={this.handleCloseUsers.bind(this)}
          autoScrollBodyContent={true}
          actions={usersActions}
        >
          <div>
            {this.state.usersIds.map((userId) => {
              const user = R.propOr({}, userId, this.props.users);
              const userFirstname = R.propOr('-', 'user_firstname', user);
              const userLastname = R.propOr('-', 'user_lastname', user);
              const userGravatar = R.propOr('-', 'user_gravatar', user);
              return (
                <Chip
                  key={userId}
                  onRequestDelete={this.removeUser.bind(this, userId)}
                  type={Constants.CHIP_TYPE_LIST}
                >
                  <Avatar
                    src={userGravatar}
                    size={32}
                    type={Constants.AVATAR_TYPE_CHIP}
                  />
                  {userFirstname} {userLastname}
                </Chip>
              );
            })}
            <div className="clearfix"></div>
          </div>
          <div>
            <List>
              {filteredUsers.map((user) => {
                const disabled = R.find(
                  (userId) => userId === user.user_id,
                  this.state.usersIds,
                ) !== undefined;
                const userOrganization = R.propOr(
                  {},
                  user.user_organization,
                  this.props.organizations,
                );
                const organizationName = R.propOr(
                  '-',
                  'organization_name',
                  userOrganization,
                );
                return (
                  <MainSmallListItem
                    key={user.user_id}
                    disabled={disabled}
                    onClick={this.addUser.bind(this, user.user_id)}
                    primaryText={
                      <div>
                        <div style={styles.name}>
                          {user.user_firstname} {user.user_lastname}
                        </div>
                        <div style={styles.mail}>{user.user_email}</div>
                        <div style={styles.org}>{organizationName}</div>
                        <div className="clearfix"></div>
                      </div>
                    }
                    leftAvatar={
                      <Avatar
                        type={Constants.AVATAR_TYPE_LIST}
                        src={user.user_gravatar}
                      />
                    }
                  />
                );
              })}
            </List>
          </div>
        </DialogTitleElement>
        <Dialog
          title="Manage grants"
          modal={false}
          open={this.state.openGrants}
          onRequestClose={this.handleCloseGrants.bind(this)}
          actions={grantsActions}
        >
          <Table selectable={false} style={{ marginTop: '5px' }}>
            <TableHead adjustForCheckbox={false} displaySelectAll={false}>
              <TableRow>
                <TableCell>
                  <T>Exercise</T>
                </TableCell>
                <TableCell>
                  <T>Read/Write</T>
                </TableCell>
                <TableCell>
                  <T>Read only</T>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody displayRowCheckbox={false}>
              {R.values(this.props.exercises).map((exercise) => {
                const grantPlanner = R.find(
                  (g) => g.grant_exercise.exercise_id === exercise.exercise_id
                    && g.grant_name === 'PLANNER',
                )(this.props.group.group_grants);
                const grantObserver = R.find(
                  (g) => g.grant_exercise.exercise_id === exercise.exercise_id
                    && g.grant_name === 'OBSERVER',
                )(this.props.group.group_grants);
                const grantPlannerId = R.propOr(null, 'grant_id', grantPlanner);
                const grantObserverId = R.propOr(
                  null,
                  'grant_id',
                  grantObserver,
                );

                return (
                  <TableRow key={exercise.exercise_id}>
                    <TableCell>{exercise.exercise_name}</TableCell>
                    <TableCell>
                      <Checkbox
                        defaultChecked={grantPlannerId !== null}
                        onCheck={this.handleGrantCheck.bind(
                          this,
                          exercise.exercise_id,
                          grantPlannerId,
                          'PLANNER',
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <Checkbox
                        defaultChecked={grantObserverId !== null}
                        onCheck={this.handleGrantCheck.bind(
                          this,
                          exercise.exercise_id,
                          grantObserverId,
                          'OBSERVER',
                        )}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Dialog>
      </div>
    );
  }
}

const select = (state) => ({
  users: state.referential.entities.users,
  organizations: state.referential.entities.organizations,
  exercises: state.referential.entities.exercises,
});

GroupPopover.propTypes = {
  group: PropTypes.object,
  fetchGroup: PropTypes.func,
  updateGroup: PropTypes.func,
  deleteGroup: PropTypes.func,
  addGrant: PropTypes.func,
  deleteGrant: PropTypes.func,
  organizations: PropTypes.object,
  exercises: PropTypes.object,
  users: PropTypes.object,
  groupUsersIds: PropTypes.array,
  children: PropTypes.node,
};

export default connect(select, {
  fetchGroup,
  updateGroup,
  deleteGroup,
  addGrant,
  deleteGrant,
})(GroupPopover);
