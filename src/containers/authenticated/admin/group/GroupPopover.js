import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import R from 'ramda'
import * as Constants from '../../../../constants/ComponentTypes'
import {Popover} from '../../../../components/Popover';
import {Menu} from '../../../../components/Menu'
import {Dialog, DialogTitleElement} from '../../../../components/Dialog'
import {IconButton, FlatButton} from '../../../../components/Button'
import {Icon} from '../../../../components/Icon'
import {MenuItemLink, MenuItemButton} from "../../../../components/menu/MenuItem"
import {SimpleTextField} from '../../../../components/SimpleTextField'
import {Chip} from '../../../../components/Chip'
import {Avatar} from '../../../../components/Avatar'
import {List} from '../../../../components/List'
import {MainSmallListItem} from '../../../../components/list/ListItem'
import {updateGroup, deleteGroup} from '../../../../actions/Group'
import {fetchUsers} from '../../../../actions/User'
import {fetchOrganizations} from '../../../../actions/Organization'
import GroupForm from './GroupForm'

const styles = {
  'main': {
    position: 'absolute',
    top: '7px',
    right: 0,
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
    }
  }

  componentDidMount() {
    this.props.fetchUsers()
    this.props.fetchOrganizations()
  }

  handlePopoverOpen(event) {
    event.preventDefault()
    this.setState({
      openPopover: true,
      anchorEl: event.currentTarget,
    })
  }

  handlePopoverClose() {
    this.setState({openPopover: false})
  }

  handleOpenEdit() {
    this.setState({openEdit: true})
    this.handlePopoverClose()
  }

  handleCloseEdit() {
    this.setState({openEdit: false})
  }

  onSubmitEdit(data) {
    return this.props.updateGroup(this.props.group.group_id, data)
  }

  submitFormEdit() {
    this.refs.groupForm.submit()
  }

  handleOpenUsers() {
    this.setState({openUsers: true})
    this.handlePopoverClose()
  }

  handleSearchUsers(event, value) {
    this.setState({searchTerm: value})
  }

  addUser(userId) {
    this.setState({usersIds: R.append(userId, this.state.usersIds)})
  }

  removeUser(userId) {
    this.setState({usersIds: R.filter(u => u !== userId, this.state.usersIds)})
  }

  handleCloseUsers() {
    this.setState({openUsers: false, searchTerm: ''})
  }

  submitAddUsers() {
    this.props.updateGroup(this.props.group.group_id, {group_users: this.state.usersIds})
    this.handleCloseUsers()
  }

  handleOpenGrants() {
    this.setState({openGrants: true})
    this.handlePopoverClose()
  }

  handleCloseGrants() {
    this.setState({openGrants: false})
  }

  submitGrants() {
    this.props.updateGroup(this.props.group.group_id, {group_users: this.state.usersIds})
    this.handleCloseGrants()
  }


  handleOpenDelete() {
    this.setState({openDelete: true})
    this.handlePopoverClose()
  }

  handleCloseDelete() {
    this.setState({openDelete: false})
  }

  submitDelete() {
    this.props.deleteGroup(this.props.group.group_id)
    this.handleCloseDelete()
  }

  render() {
    const grantsActions = [
      <FlatButton label="Cancel" primary={true} onTouchTap={this.handleCloseGrants.bind(this)}/>,
      <FlatButton label="Update" primary={true} onTouchTap={this.submitGrants.bind(this)}/>,
    ]
    const usersActions = [
      <FlatButton label="Cancel" primary={true} onTouchTap={this.handleCloseUsers.bind(this)}/>,
      <FlatButton label="Update" primary={true} onTouchTap={this.submitAddUsers.bind(this)}/>,
    ]
    const editActions = [
      <FlatButton label="Cancel" primary={true} onTouchTap={this.handleCloseEdit.bind(this)}/>,
      <FlatButton label="Update" primary={true} onTouchTap={this.submitFormEdit.bind(this)}/>,
    ]
    const deleteActions = [
      <FlatButton label="Cancel" primary={true} onTouchTap={this.handleCloseDelete.bind(this)}/>,
      <FlatButton label="Delete" primary={true} onTouchTap={this.submitDelete.bind(this)}/>,
    ]

    let initialValues = R.pick(['group_name'], this.props.group) //Pickup only needed fields

    //region filter users by active keyword
    const keyword = this.state.searchTerm
    let filterByKeyword = n => keyword === '' ||
    n.user_email.toLowerCase().indexOf(keyword.toLowerCase()) !== -1 ||
    n.user_firstname.toLowerCase().indexOf(keyword.toLowerCase()) !== -1 ||
    n.user_lastname.toLowerCase().indexOf(keyword.toLowerCase()) !== -1
    let filteredUsers = R.filter(filterByKeyword, R.values(this.props.users))
    //endregion

    return (
      <div style={styles.main}>
        <IconButton onClick={this.handlePopoverOpen.bind(this)}>
          <Icon name={Constants.ICON_NAME_NAVIGATION_MORE_VERT}/>
        </IconButton>
        <Popover open={this.state.openPopover} anchorEl={this.state.anchorEl}
                 onRequestClose={this.handlePopoverClose.bind(this)}>
          <Menu multiple={false}>
            <MenuItemLink label="Edit" onTouchTap={this.handleOpenEdit.bind(this)}/>
            <MenuItemLink label="Manage users" onTouchTap={this.handleOpenUsers.bind(this)}/>
            <MenuItemButton label="Delete" onTouchTap={this.handleOpenDelete.bind(this)}/>
          </Menu>
        </Popover>
        <Dialog title="Confirmation" modal={false} open={this.state.openDelete}
                onRequestClose={this.handleCloseDelete.bind(this)}
                actions={deleteActions}>
          Do you confirm the removing of this group?
        </Dialog>
        <Dialog title="Update the group" modal={false} open={this.state.openEdit}
                onRequestClose={this.handleCloseEdit.bind(this)}
                actions={editActions}>
          <GroupForm ref="groupForm" initialValues={initialValues}
                     onSubmit={this.onSubmitEdit.bind(this)}
                     onSubmitSuccess={this.handleCloseEdit.bind(this)}/>
        </Dialog>
        <DialogTitleElement
          title={<SimpleTextField name="keyword" fullWidth={true} type="text" hintText="Search for a user"
                                  onChange={this.handleSearchUsers.bind(this)}
                                  styletype={Constants.FIELD_TYPE_INTITLE}/>}
          modal={false}
          open={this.state.openUsers}
          onRequestClose={this.handleCloseUsers.bind(this)}
          autoScrollBodyContent={true}
          actions={usersActions}
          contentStyle={styles.dialog}>
          <div style={styles.list}>
            {this.state.usersIds.map(userId => {
              let user =  R.propOr({}, userId, this.props.users)
              let user_firstname = R.propOr('-', 'user_firstname', user)
              let user_lastname = R.propOr('-', 'user_lastname', user)
              let user_gravatar = R.propOr('-', 'user_gravatar', user)
              return (
                <Chip
                  key={userId}
                  onRequestDelete={this.removeUser.bind(this, userId)}
                  type={Constants.CHIP_TYPE_LIST}>
                  <Avatar src={user_gravatar} size={32} type={Constants.AVATAR_TYPE_CHIP}/>
                  {user_firstname} {user_lastname}
                </Chip>
              )
            })}
            <div className="clearfix"></div>
          </div>
          <div style={styles.search}>
            <List>
              {filteredUsers.map(user => {
                let disabled = R.find(user_id => user_id === user.audience_id, this.state.usersIds) !== undefined
                let user_organization = R.propOr({}, user.user_organization, this.props.organizations)
                let organizationName = R.propOr('-', 'organization_name', user_organization)
                return (
                  <MainSmallListItem
                    key={user.user_id}
                    disabled={disabled}
                    onClick={this.addUser.bind(this, user.user_id)}
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
    )
  }
}

const select = (state) => {
  return {
    users: state.referential.entities.users,
    organizations: state.referential.entities.organizations
  }
}

GroupPopover.propTypes = {
  group: PropTypes.object,
  fetchUsers: PropTypes.func,
  fetchOrganizations: PropTypes.func,
  updateGroup: PropTypes.func,
  deleteGroup: PropTypes.func,
  organizations: PropTypes.object,
  groupUsersIds: PropTypes.array,
  users: PropTypes.object,
  children: PropTypes.node
}

export default connect(select, {fetchUsers, fetchOrganizations, updateGroup, deleteGroup})(GroupPopover)
