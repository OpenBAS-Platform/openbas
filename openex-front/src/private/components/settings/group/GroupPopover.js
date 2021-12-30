import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Button from '@mui/material/Button';
import Slide from '@mui/material/Slide';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Checkbox from '@mui/material/Checkbox';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import { MoreVert } from '@mui/icons-material';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import withStyles from '@mui/styles/withStyles';
import {
  fetchGroup,
  updateGroup,
  deleteGroup,
} from '../../../../actions/Group';
import { addGrant, deleteGrant } from '../../../../actions/Grant';
import GroupForm from './GroupForm';
import SearchFilter from '../../../../components/SearchFilter';
import inject18n from '../../../../components/i18n';

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
    };
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

  handleGrantCheck(exerciseId, grantId, grantName, event) {
    const isChecked = event.target.checked;
    if (isChecked) {
      this.props
        .addGrant(this.props.group.group_id, {
          grant_name: grantName,
          grant_exercise: exerciseId,
        })
        .then(() => {
          this.props.fetchGroup(this.props.group.group_id);
        });
    }
    // the grand does not exist
    if (!isChecked && grantId !== null) {
      this.props.deleteGrant(this.props.group.group_id, grantId).then(() => {
        this.props.fetchGroup(this.props.group.group_id);
      });
    }
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
    const { classes, t } = this.props;
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
          style={{ marginTop: 50 }}
        >
          <MenuItem onClick={this.handleOpenEdit.bind(this)}>
            {t('Edit')}
          </MenuItem>
          <MenuItem onClick={this.handleOpenUsers.bind(this)}>
            {t('Manage users')}
          </MenuItem>
          <MenuItem onClick={this.handleOpenGrants.bind(this)}>
            {t('Manage grants')}
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
              {t('Do you want to delete this group?')}
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
        >
          <DialogTitle>{t('Update the group')}</DialogTitle>
          <DialogContent>
            <GroupForm
              initialValues={initialValues}
              onSubmit={this.onSubmitEdit.bind(this)}
              onSubmitSuccess={this.handleCloseEdit.bind(this)}
              handleClose={this.handleCloseEdit.bind(this)}
            />
          </DialogContent>
        </Dialog>
        <Dialog
          open={this.state.openUsers}
          TransitionComponent={Transition}
          onClose={this.handleCloseUsers.bind(this)}
          fullWidth={true}
          maxWidth="md"
        >
          <DialogTitle>
            <SearchFilter
              onChange={this.handleSearchUsers.bind(this)}
              fullWidth={true}
            />
          </DialogTitle>
          <DialogContent>
            <duv>
              {this.state.usersIds.map((userId) => {
                const user = R.propOr({}, userId, this.props.users);
                const userFirstname = R.propOr('-', 'user_firstname', user);
                const userLastname = R.propOr('-', 'user_lastname', user);
                const userGravatar = R.propOr('-', 'user_gravatar', user);
                return (
                  <Chip
                    key={userId}
                    onDelete={this.removeUser.bind(this, userId)}
                    label={`${userFirstname} ${userLastname}`}
                    variant="outlined"
                    avatar={<Avatar src={userGravatar} size={32} />}
                  />
                );
              })}
              <div className="clearfix" />
            </duv>
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
                  <ListItem
                    key={user.user_id}
                    disabled={disabled}
                    button={true}
                    divider={true}
                    onClick={this.addUser.bind(this, user.user_id)}
                  >
                    <ListItemAvatar>
                      <Avatar src={user.user_gravatar} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <div>
                          <div className={classes.name}>
                            {user.user_firstname} {user.user_lastname}
                          </div>
                          <div className={classes.mail}>{user.user_email}</div>
                          <div className={classes.org}>{organizationName}</div>
                          <div className="clearfix" />
                        </div>
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              color="secondary"
              onClick={this.handleCloseUsers.bind(this)}
            >
              {t('Cancel')}
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={this.submitAddUsers.bind(this)}
            >
              {t('Update')}
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={this.state.openGrants}
          TransitionComponent={Transition}
          onClose={this.handleCloseGrants.bind(this)}
          fullWidth={true}
          maxWidth="md"
        >
          <DialogTitle>{t('Manage grants')}</DialogTitle>
          <DialogContent>
            <Table selectable={false} style={{ marginTop: '5px' }}>
              <TableHead adjustForCheckbox={false} displaySelectAll={false}>
                <TableRow>
                  <TableCell>{t('Exercise')}</TableCell>
                  <TableCell>{t('Read/Write')}</TableCell>
                  <TableCell>{t('Read only')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody displayRowCheckbox={false}>
                {R.values(this.props.exercises).map((exercise) => {
                  const grantPlanner = R.find(
                    (g) => g.grant_exercise === exercise.exercise_id
                      && g.grant_name === 'PLANNER',
                  )(this.props.group.group_grants);
                  const grantObserver = R.find(
                    (g) => g.grant_exercise === exercise.exercise_id
                      && g.grant_name === 'OBSERVER',
                  )(this.props.group.group_grants);
                  const grantPlannerId = R.propOr(
                    null,
                    'grant_id',
                    grantPlanner,
                  );
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
                          checked={grantPlannerId !== null}
                          onChange={this.handleGrantCheck.bind(
                            this,
                            exercise.exercise_id,
                            grantPlannerId,
                            'PLANNER',
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <Checkbox
                          checked={
                            grantObserverId !== null || grantPlannerId !== null
                          }
                          disabled={grantPlannerId !== null}
                          onChange={this.handleGrantCheck.bind(
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
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              color="secondary"
              onClick={this.handleCloseGrants.bind(this)}
            >
              {t('Close')}
            </Button>
          </DialogActions>
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
  t: PropTypes.func,
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
};

export default R.compose(
  connect(select, {
    fetchGroup,
    updateGroup,
    deleteGroup,
    addGrant,
    deleteGrant,
  }),
  inject18n,
  withStyles(styles),
)(GroupPopover);
