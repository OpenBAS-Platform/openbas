import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import Button from '@material-ui/core/Button';
import Fab from '@material-ui/core/Fab';
import { i18nRegister } from '../../../../../utils/Messages';
import * as Constants from '../../../../../constants/ComponentTypes';
import { updateSubaudience } from '../../../../../actions/Subaudience';
import { fetchUsers } from '../../../../../actions/User';
import CreateUser from './CreateUser';
import { DialogTitleElement } from '../../../../../components/Dialog';
import { Chip } from '../../../../../components/Chip';
import { Avatar } from '../../../../../components/Avatar';
import { List } from '../../../../../components/List';
import { MainSmallListItem } from '../../../../../components/list/ListItem';
import { SimpleTextField } from '../../../../../components/SimpleTextField';

const styles = {
  name: {
    float: 'left',
    width: '30%',
    padding: '5px 0 0 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  mail: {
    float: 'left',
    width: '40%',
    padding: '5px 0 0 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  org: {
    float: 'left',
    width: '25%',
    padding: '5px 0 0 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
};

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
    const actions = [
      <Button
        key="cancel"
        label="Cancel"
        primary={true}
        onClick={this.handleCloseAddUsers.bind(this)}
      />,
      <Button
        key="add"
        label="Add these users"
        primary={true}
        onClick={this.submitAddUsers.bind(this)}
      />,
      <CreateUser key="create" exerciseId={this.props.exerciseId} />,
    ];

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
          type={Constants.BUTTON_TYPE_FLOATING_PADDING}
          onClick={this.handleOpenAddUsers.bind(this)}
        />
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
          open={this.state.openAddUsers}
          onRequestClose={this.handleCloseAddUsers.bind(this)}
          autoScrollBodyContent={true}
          actions={actions}
        >
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
                  <MainSmallListItem
                    key={user.user_id}
                    disabled={disabled}
                    onClick={this.addUser.bind(this, user)}
                    primaryText={
                      <div>
                        <div style={styles.name}>
                          {user.user_firstname} {user.user_lastname}
                        </div>
                        <div style={styles.mail}>{user.user_email}</div>
                        <div style={styles.org}>{organizationName}</div>
                        <div className="clearfix" />
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

export default connect(select, {
  fetchUsers,
  updateSubaudience,
})(AddUsers);
