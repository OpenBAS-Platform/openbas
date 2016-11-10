import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {Map, fromJS, List as iList} from 'immutable'
import createImmutableSelector from '../../../../utils/ImmutableSelect'
import R from 'ramda'
import * as Constants from '../../../../constants/ComponentTypes'
import {updateAudience} from '../../../../actions/Audience'
import {fetchUsers, searchUsers} from '../../../../actions/User'
import {DialogTitleElement} from '../../../../components/Dialog';
import {Chip} from '../../../../components/Chip';
import {Avatar} from '../../../../components/Avatar';
import {List} from '../../../../components/List'
import {AvatarListItemLink} from '../../../../components/list/ListItem';
import {FlatButton, FloatingActionsButtonCreate} from '../../../../components/Button';
import {SimpleTextField} from '../../../../components/SimpleTextField'
import CreateUser from './CreateUser'

const styles = {
  dialog: {
    width: '780px',
    minHeight: '500px',
    maxWidth: 'none'
  },
  list: {
    float: 'right',
    width: '200px',
    height: '100%',
    padding: '0 0 0 10px',
    borderLeft: '1px solid #f0f0f0'
  },
  search: {
    float: 'left',
    width: '460px',
    padding: '0 10px 0 0',
  }
}

class AddUsers extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openAddUsers: false,
      openCreateUser: false,
      users: Map(),
      users_ids: iList(),
    }
  }

  componentDidMount() {
    this.props.fetchUsers();
  }

  handleOpenAddUsers() {
    this.setState({openAddUsers: true})
  }

  handleCloseAddUsers() {
    this.setState({openAddUsers: false})
  }

  handleOpenCreateUser() {
    this.setState({openCreateUser: true})
  }

  handleCloseCreateUser() {
    this.setState({openCreateUser: false})
  }

  handleSearchUsers(event, value) {
    this.props.searchUsers(value)
  }

  addUser(user) {
    this.setState({users: this.state.users.set(user.get('user_id'), user)})
    if (this.state.users_ids.keyOf(user.get('user_id')) === undefined) {
      this.setState({users_ids: this.state.users_ids.push(user.get('user_id'))})
    }
  }

  removeUser(user) {
    this.setState({
      users: this.state.users.delete(user.get('user_id')),
      users_ids: this.state.users_ids.delete(this.state.users_ids.keyOf(user.get('user_id')))
    })
  }

  submitAddUsers() {
    let usersList = this.props.audienceUsersIds.concat(this.state.users_ids)
    let data = Map({
      audience_users: usersList
    })
    this.props.updateAudience(this.props.exerciseId, this.props.audienceId, data)
    this.setState({
      users: Map(),
      users_ids: iList(),
    })
    this.handleCloseAddUsers()
  }

  render() {
    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onTouchTap={this.handleCloseAddUsers.bind(this)}
      />,
      <FlatButton
        label="Add users"
        primary={true}
        onTouchTap={this.submitAddUsers.bind(this)}
      />,
    ];

    return (
      <div>
        <FloatingActionsButtonCreate type={Constants.BUTTON_TYPE_FLOATING_PADDING}
                                     onClick={this.handleOpenAddUsers.bind(this)}/>
        <DialogTitleElement
          title={<SimpleTextField name="keyword" fullWidth={true} type="text" hintText="Search for a user"
                                   onChange={this.handleSearchUsers.bind(this)} styletype={Constants.FIELD_TYPE_INTITLE} />}
          modal={false}
          open={this.state.openAddUsers}
          onRequestClose={this.handleCloseAddUsers.bind(this)}
          autoScrollBodyContent={true}
          actions={actions}
          contentStyle={styles.dialog}
        >
          <div style={styles.list}>
            {this.state.users.toList().map(user => {
              return (
                <Chip
                  key={user.get('user_id')}
                  onRequestDelete={this.removeUser.bind(this, user)}
                  type={Constants.CHIP_TYPE_LIST}
                >
                  <Avatar src={user.get('user_gravatar')}/>
                  {user.get('user_firstname')} {user.get('user_lastname')}
                </Chip>
              )
            })}
          </div>
          <div style={styles.search}>
            <List>
              {this.props.users.toList().map(user => {
                let disabled = false
                if (this.state.users_ids.keyOf(user.get('user_id')) !== undefined
                  || this.props.audienceUsersIds.keyOf(user.get('user_id')) !== undefined) {
                  disabled = true
                }
                return (
                  <AvatarListItemLink
                    key={user.get('user_id')}
                    disabled={disabled}
                    onClick={this.addUser.bind(this, user)}
                    label={user.get('user_firstname') + " " + user.get('user_lastname')}
                    leftAvatar={<Avatar type={Constants.AVATAR_TYPE_LIST} src={user.get('user_gravatar')}/>}
                  />
                )
              })}
              <CreateUser exerciseId={this.props.exerciseId} />
            </List>
          </div>
        </DialogTitleElement>
      </div>
    );
  }
}

const usersSelector = (state) => {
  const users = state.application.getIn(['entities', 'users']).toJS()
  let keyword = state.application.getIn(['ui', 'states', 'current_search_keyword'])
  var filterByKeyword = n => keyword === '' || n.user_email.toLowerCase().indexOf(keyword) !== -1 || n.user_firstname.toLowerCase().indexOf(keyword) !== -1 || n.user_lastname.toLowerCase().indexOf(keyword) !== -1
  var filteredUsers = R.filter(filterByKeyword, users)
  return fromJS(filteredUsers)
}
const filteredUsers = createImmutableSelector(usersSelector, users => users)

AddUsers.propTypes = {
  exerciseId: PropTypes.string,
  audienceId: PropTypes.string,
  fetchUsers: PropTypes.func,
  searchUsers: PropTypes.func,
  updateAudience: PropTypes.func,
  users: PropTypes.object,
  audienceUsersIds: PropTypes.object
}

const select = (state, props) => {
  return {
    users: filteredUsers(state, props),
  }
}

export default connect(select, {fetchUsers, searchUsers, updateAudience})(AddUsers);