import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import R from 'ramda'
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';
import {T} from '../../../../components/I18n'
import {i18nRegister} from '../../../../utils/Messages'
import * as Constants from '../../../../constants/ComponentTypes'
import {Popover} from '../../../../components/Popover';
import {Menu} from '../../../../components/Menu'
import {Dialog, DialogTitleElement} from '../../../../components/Dialog'
import {IconButton, FlatButton} from '../../../../components/Button'
import {Icon} from '../../../../components/Icon'
import {MenuItemLink, MenuItemButton} from "../../../../components/menu/MenuItem"
import {SimpleTextField} from '../../../../components/SimpleTextField'
import {Checkbox} from '../../../../components/Checkbox'
import {Chip} from '../../../../components/Chip'
import {Avatar} from '../../../../components/Avatar'
import {List} from '../../../../components/List'
import {MainSmallListItem} from '../../../../components/list/ListItem'
import {fetchGroup, updateGroup, deleteGroup} from '../../../../actions/Group'
import {addGrant, deleteGrant} from '../../../../actions/Grant'
import GroupForm from './GroupForm'

i18nRegister({
  fr: {
    'Manage users': 'Gérer les utilisateurs',
    'Manage grants': 'Gérer les permissions',
    'Do you want to delete this group?': 'Souhaitez-vous supprimer ce groupe ?',
    'Exercise': 'Exercice',
    'Planner': 'Planificateur',
    'Observer': 'Observateur',
    'Update the group': 'Mettre à jour le groupe',
    'Search for a user': 'Rechercher un utilisateur'
  }
})

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
      grantsToAdd: [],
      grantsToRemove: []
    }
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
    this.setState({openUsers: true, usersIds: this.props.groupUsersIds})
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

  handleGrantCheck(exerciseId, grantId, grantName, event, isChecked) {
    // the grant already exists
    if (grantId !== null && isChecked) {
      return;
      // the grant does not exist yet
    } else if (isChecked) {
      let grantsToAdd = this.state.grantsToAdd
      grantsToAdd.push({exercise_id: exerciseId, grant_name: grantName})
      this.setState({grantsToAdd: grantsToAdd})
    }

    // the grand does not exist
    if (grantId === null && !isChecked) {
      return;
    } else if (!isChecked) {
      let grantsToRemove = this.state.grantsToRemove
      grantsToRemove.push({exercise_id: exerciseId, grant_id: grantId})
      this.setState({grantsToRemove: grantsToRemove})
    }
  }

  submitGrants() {
    let grantsToAdd = this.state.grantsToAdd
    let addGrant = n => this.props.addGrant(this.props.group.group_id, {
      grant_name: n.grant_name,
      grant_exercise: n.exercise_id
    }).then(() => {
      this.props.fetchGroup(this.props.group.group_id)
    })
    R.forEach(addGrant, grantsToAdd)
    this.setState({grantsToAdd: []})

    let grantsToRemove = this.state.grantsToRemove
    let deleteGrant = n => this.props.deleteGrant(this.props.group.group_id, n.grant_id).then(() => {
      this.props.fetchGroup(this.props.group.group_id)
    })
    R.forEach(deleteGrant, grantsToRemove)
    this.setState({grantsToRemove: []})

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
            <MenuItemLink label="Manage grants" onTouchTap={this.handleOpenGrants.bind(this)}/>
            <MenuItemButton label="Delete" onTouchTap={this.handleOpenDelete.bind(this)}/>
          </Menu>
        </Popover>
        <Dialog title="Confirmation" modal={false} open={this.state.openDelete}
                onRequestClose={this.handleCloseDelete.bind(this)}
                actions={deleteActions}>
          <T>Do you want to delete this group?</T>
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
          actions={usersActions}>
          <div>
            {this.state.usersIds.map(userId => {
              let user = R.propOr({}, userId, this.props.users)
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
          <div>
            <List>
              {filteredUsers.map(user => {
                let disabled = R.find(user_id => user_id === user.user_id, this.state.usersIds) !== undefined
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
        <Dialog title="Manage grants" modal={false} open={this.state.openGrants}
                onRequestClose={this.handleCloseGrants.bind(this)}
                actions={grantsActions}>
          <Table selectable={false}>
            <TableHeader adjustForCheckbox={false} displaySelectAll={false}>
              <TableRow>
                <TableHeaderColumn><T>Exercise</T></TableHeaderColumn>
                <TableHeaderColumn><T>Planner</T></TableHeaderColumn>
                <TableHeaderColumn><T>Observer</T></TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody displayRowCheckbox={false}>
              {R.values(this.props.exercises).map(exercise => {
                let grantPlanner = R.find(g => g.grant_exercise.exercise_id === exercise.exercise_id && g.grant_name === 'PLANNER')(this.props.group.group_grants)
                let grantObserver = R.find(g => g.grant_exercise.exercise_id === exercise.exercise_id && g.grant_name === 'OBSERVER')(this.props.group.group_grants)
                let grantPlannerId = R.propOr(null, 'grant_id', grantPlanner)
                let grantObserverId = R.propOr(null, 'grant_id', grantObserver)

                return (
                  <TableRow key={exercise.exercise_id}>
                    <TableRowColumn>{exercise.exercise_name}</TableRowColumn>
                    <TableRowColumn><Checkbox defaultChecked={grantPlannerId !== null}
                                              onCheck={this.handleGrantCheck.bind(this, exercise.exercise_id, grantPlannerId, 'PLANNER')}/></TableRowColumn>
                    <TableRowColumn><Checkbox defaultChecked={grantObserverId !== null}
                                              onCheck={this.handleGrantCheck.bind(this, exercise.exercise_id, grantObserverId, 'OBSERVER')}/></TableRowColumn>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </Dialog>
      </div>
    )
  }
}

const select = (state) => {
  return {
    users: state.referential.entities.users,
    organizations: state.referential.entities.organizations,
    exercises: state.referential.entities.exercises,
  }
}

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
  children: PropTypes.node
}

export default connect(select, {fetchGroup, updateGroup, deleteGroup, addGrant, deleteGrant})(GroupPopover)
