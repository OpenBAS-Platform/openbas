import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import Button from '@mui/material/Button';
import Fab from '@mui/material/Fab';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import TextField from '@mui/material/TextField';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import { Add } from '@mui/icons-material';
import withStyles from '@mui/styles/withStyles';
import Slide from '@mui/material/Slide';
import { T } from '../../../../../components/I18n';
import { i18nRegister } from '../../../../../utils/Messages';
import { fetchUsers } from '../../../../../actions/User';
import CreateUser from './CreateUser';
import { updateAudienceUsers } from '../../../../../actions/Audience';

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

const styles = () => ({
  createButton: {
    position: 'fixed',
    bottom: 30,
    right: 30,
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

  handleSearchUsers(event) {
    this.setState({ searchTerm: event.target.value });
  }

  addUser(user) {
    if (
      !this.props.audienceUsersIds.includes(user.user_id)
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
    const userIds = R.pipe(
      R.map((u) => u.user_id),
      R.concat(this.props.audienceUsersIds),
    )(this.state.users);
    this.props.updateAudienceUsers(
      this.props.exerciseId,
      this.props.audienceId,
      { audience_users: userIds },
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
          TransitionComponent={Transition}
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
                  onDelete={this.removeUser.bind(this, user)}
                  avatar={<Avatar src={user.user_gravatar} />}
                  variant="outlined"
                  label={`${user.user_firstname} ${user.user_lastname}`}
                />
              ))}
              <div className="clearfix" />
            </div>
            <List>
              {R.take(10, filteredUsers).map((user) => {
                const disabled = R.find(
                  (u) => u.user_id === user.user_id,
                  this.state.users,
                ) !== undefined
                  || this.props.audienceUsersIds.includes(user.user_id);
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
                          <div className={classes.org}>{organizationName}</div>
                          <div className="clearfix" />
                        </div>
                      }
                      secondary={user.user_email}
                    />
                  </ListItem>
                );
              })}
            </List>
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
  fetchUsers: PropTypes.func,
  updateAudienceUsers: PropTypes.func,
  users: PropTypes.object,
  organizations: PropTypes.object,
  audienceUsersIds: PropTypes.array,
};

const select = (state) => ({
  users: state.referential.entities.users,
  organizations: state.referential.entities.organizations,
});

export default R.compose(
  connect(select, {
    fetchUsers,
    updateAudienceUsers,
  }),
  withStyles(styles),
)(AddUsers);
