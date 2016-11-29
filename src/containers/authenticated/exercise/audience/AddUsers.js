import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import R from 'ramda'
import * as Constants from '../../../../constants/ComponentTypes'
import {updateAudience} from '../../../../actions/Audience'
import {fetchUsers} from '../../../../actions/User'
import {DialogTitleElement} from '../../../../components/Dialog'
import {Chip} from '../../../../components/Chip'
import {Avatar} from '../../../../components/Avatar'
import {List} from '../../../../components/List'
import {MainSmallListItem} from '../../../../components/list/ListItem'
import {FlatButton, FloatingActionsButtonCreate} from '../../../../components/Button'
import {SimpleTextField} from '../../../../components/SimpleTextField'
import CreateUser from './CreateUser'

const styles = {
  dialog: {

  },
  list: {

  },
  search: {

  },
  'name': {
    float: 'left',
    width: '30%',
    padding: '5px 0 0 0'
  },
  'mail': {
    float: 'left',
    width: '40%',
    padding: '5px 0 0 0'
  },
  'org': {
    float: 'left',
    padding: '5px 0 0 0'
  },
}

class AddUsers extends Component {
  constructor(props) {
    super(props);
    this.state = {openAddUsers: false, searchTerm: '', users: []}
  }

  handleOpenAddUsers() {
    this.setState({openAddUsers: true})
  }

  handleCloseAddUsers() {
    this.setState({openAddUsers: false, searchTerm: '', users: []})
  }

  handleSearchUsers(event, value) {
    this.setState({searchTerm: value})
  }

  addUser(user) {
    this.setState({users: R.append(user, this.state.users)})
  }

  removeUser(user) {
    this.setState({users: R.filter(u => u.user_id !== user.user_id, this.state.users)})
  }

  submitAddUsers() {
    let usersList = R.pipe(
      R.map(u => u.user_id),
      R.concat(this.props.audienceUsersIds)
    )(this.state.users)
    this.props.updateAudience(this.props.exerciseId, this.props.audienceId, {audience_users: usersList})
    this.handleCloseAddUsers()
  }

  render() {

    const actions = [
      <FlatButton label="Cancel" primary={true} onTouchTap={this.handleCloseAddUsers.bind(this)}/>,
      <FlatButton label="Add users" primary={true} onTouchTap={this.submitAddUsers.bind(this)}/>,
      <CreateUser exerciseId={this.props.exerciseId} />
    ]

    //region filter users by active keyword
    const keyword = this.state.searchTerm
    let filterByKeyword = n => keyword === '' ||
                          n.user_email.toLowerCase().indexOf(keyword.toLowerCase()) !== -1 ||
                          n.user_firstname.toLowerCase().indexOf(keyword.toLowerCase()) !== -1 ||
                          n.user_lastname.toLowerCase().indexOf(keyword.toLowerCase()) !== -1
    let filteredUsers = R.filter(filterByKeyword, R.values(this.props.users))
    //endregion

    return (
      <div>
        <FloatingActionsButtonCreate type={Constants.BUTTON_TYPE_FLOATING_PADDING}
                                     onClick={this.handleOpenAddUsers.bind(this)}/>
        <DialogTitleElement
          title={<SimpleTextField name="keyword" fullWidth={true} type="text" hintText="Search for a user"
                                   onChange={this.handleSearchUsers.bind(this)}
                                  styletype={Constants.FIELD_TYPE_INTITLE} />}
          modal={false}
          open={this.state.openAddUsers}
          onRequestClose={this.handleCloseAddUsers.bind(this)}
          autoScrollBodyContent={true}
          actions={actions}
          contentStyle={styles.dialog}>
          <div style={styles.list}>
            {this.state.users.map(user => {
              return (
                <Chip
                  key={user.user_id}
                  onRequestDelete={this.removeUser.bind(this, user)}
                  type={Constants.CHIP_TYPE_LIST}>
                  <Avatar src={user.user_gravatar} size={32} type={Constants.AVATAR_TYPE_CHIP}/>
                  {user.user_firstname} {user.user_lastname}
                </Chip>
              )
            })}
            <div className="clearfix"></div>
          </div>
          <div style={styles.search}>
            <List>
              {filteredUsers.map(user => {
                let disabled = R.find(u => u.user_id === user.user_id, this.state.users) !== undefined
                  || this.props.audienceUsersIds.includes(user.user_id)
                let user_organization = R.propOr({}, user.user_organization, this.props.organizations)
                let organizationName = R.propOr('-', 'organization_name', user_organization)
                return (
                  <MainSmallListItem
                    key={user.user_id}
                    disabled={disabled}
                    onClick={this.addUser.bind(this, user)}
                    primaryText={
                      <div>
                        <div style={styles.name}>{user.user_firstname} {user.user_lastname}</div>
                        <div style={styles.mail}>{user.user_email}</div>
                        <div style={styles.org}>{organizationName}</div>
                        <div className="clearfix"></div>
                      </div>
                    }
                    leftAvatar={<Avatar type={Constants.AVATAR_TYPE_LIST} src={user.user_gravatar}/>}
                  />
                )
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
  fetchUsers: PropTypes.func,
  updateAudience: PropTypes.func,
  users: PropTypes.object,
  organizations: PropTypes.object,
  audienceUsersIds: PropTypes.array
}

const select = (state) => {
  return {
    users: state.referential.entities.users,
    organizations: state.referential.entities.organizations
  }
}

export default connect(select, {fetchUsers, updateAudience})(AddUsers);