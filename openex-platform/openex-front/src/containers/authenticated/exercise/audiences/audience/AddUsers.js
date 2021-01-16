import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import Button from '@material-ui/core/Button';
import Fab from '@material-ui/core/Fab';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Chip from '@material-ui/core/Chip';
import Avatar from '@material-ui/core/Avatar';
import List from '@material-ui/core/List';
import TextField from '@material-ui/core/TextField';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import { Add } from '@material-ui/icons';
import { withStyles } from '@material-ui/core/styles';
import { T } from '../../../../../components/I18n';
import { i18nRegister } from '../../../../../utils/Messages';
import * as Constants from '../../../../../constants/ComponentTypes';
import { updateSubaudience } from '../../../../../actions/Subaudience';
import { fetchUsers } from '../../../../../actions/User';
import CreateUser from './CreateUser';

const styles = () => ({
  createButton: {
    position: 'fixed',
    bottom: 30,
    right: 330,
  },
  name: {
    float: 'left',
    width: '40%',
    padding: '5px 0 0 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  org: {
    float: 'left',
    padding: '5px 0 0 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
});

i18nRegister({
  fr: {
    'Add these users': 'Ajouter ces utilisateurs',
    'Search for a user': 'Rechercher un utilisateur',
  },
});

class AddUsers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openAddUsers: false,
      searchTerm: '',
      users: [],
    };
  }

  handleOpenAddUsers() {
    this.setState({
      openAddUsers: true,
    });
  }

  handleCloseAddUsers() {
    this.setState({
      openAddUsers: false,
      searchTerm: '',
      users: [],
    });
  }

  handleSearchUsers(event, value) {
    this.setState({
      searchTerm: value,
    });
  }

  addUser(user) {
    if (
      !this.props.subaudienceUsersIds.includes(user.user_id)
      && !this.state.users.includes(user)
    ) {
      this.setState({
        users: R.append(user, this.state.users),
      });
    }
  }

  removeUser(user) {
    this.setState({
      users: R.filter((u) => u.user_id !== user.user_id, this.state.users),
    });
  }

  submitAddUsers() {
    const usersList = R.pipe(
      R.map((u) => u.user_id),
      R.concat(this.props.subaudienceUsersIds),
    )(this.state.users);
    this.props.updateSubaudience(
      this.props.exerciseId,
      this.props.audienceId,
      this.props.subaudienceId,
      { subaudience_users: usersList },
    );
    this.handleCloseAddUsers();
  }

  render() {
    const { classes } = this.props;
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
        <Fab
          onClick={this.handleOpenAddUsers.bind(this)}
          color="secondary"
          aria-label="Add"
          className={classes.createButton}
        >
          <Add />
        </Fab>
        <Dialog
          open={this.state.openAddUsers}
          onClose={this.handleCloseAddUsers.bind(this)}
          fullWidth={true}
          maxWidth="md"
        >
          <DialogTitle>
            <TextField
              name="keyword"
              fullWidth={true}
              label={<T>Search for a user</T>}
              onChange={this.handleSearchUsers.bind(this)}
            />
          </DialogTitle>
          <DialogContent>
            <div>
              {this.state.users.map((user) => (
                <Chip
                  key={user.user_id}
                  onRequestDelete={this.removeUser.bind(this, user)}
                  type={Constants.CHIP_TYPE_LIST}
                >
                  <Avatar
                    src={user.user_gravatar}
                    size={32}
                    type={Constants.AVATAR_TYPE_CHIP}
                  />
                  {user.user_firstname} {user.user_lastname}
                </Chip>
              ))}
              <div className="clearfix" />
            </div>
            <div>
              <List>
                {R.take(10, filteredUsers).map((user) => {
                  const disabled = R.find(
                    (u) => u.user_id === user.user_id,
                    this.state.users,
                  ) !== undefined
                    || this.props.subaudienceUsersIds.includes(user.user_id);
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
                      button={true}
                      disabled={disabled}
                      onClick={this.addUser.bind(this, user)}
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
                            <div className={classes.org}>
                              {organizationName}
                            </div>
                            <div className="clearfix" />
                          </div>
                        }
                        secondary={user.user_email}
                      />
                    </ListItem>
                  );
                })}
              </List>
            </div>
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              onClick={this.handleCloseAddUsers.bind(this)}
            >
              <T>Cancel</T>
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={this.submitAddUsers.bind(this)}
            >
              <T>Add these users</T>
            </Button>
            <CreateUser exerciseId={this.props.exerciseId} />
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

AddUsers.propTypes = {
  exerciseId: PropTypes.string,
  audienceId: PropTypes.string,
  subaudienceId: PropTypes.string,
  fetchUsers: PropTypes.func,
  updateSubaudience: PropTypes.func,
  users: PropTypes.object,
  organizations: PropTypes.object,
  subaudienceUsersIds: PropTypes.array,
};

const select = (state) => ({
  users: state.referential.entities.users,
  organizations: state.referential.entities.organizations,
});

export default R.compose(
  connect(select, {
    fetchUsers,
    updateSubaudience,
  }),
  withStyles(styles),
)(AddUsers);
