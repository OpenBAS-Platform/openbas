import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import R from 'ramda'
import * as Constants from '../../../../constants/ComponentTypes'
import {Popover} from '../../../../components/Popover';
import {Menu} from '../../../../components/Menu'
import {Dialog} from '../../../../components/Dialog'
import {IconButton, FlatButton} from '../../../../components/Button'
import {Icon} from '../../../../components/Icon'
import {MenuItemLink, MenuItemButton} from "../../../../components/menu/MenuItem"
import {updateUser, deleteUser} from '../../../../actions/User'
import UserForm from './UserForm'

const style = {
  position: 'absolute',
  top: '7px',
  right: 0,
}

class UserPopover extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openDelete: false,
      openEdit: false,
      openPopover: false
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
    if( data.user_admin ) {
      data.user_admin = 1
    } else {
      data.user_admin = 0
    }
    return this.props.updateUser(this.props.user.user_id, data)
  }

  submitFormEdit() {
    this.refs.userForm.submit()
  }

  handleOpenDelete() {
    this.setState({openDelete: true})
    this.handlePopoverClose()
  }

  handleCloseDelete() {
    this.setState({openDelete: false})
  }

  submitDelete() {
    this.props.deleteUser(this.props.user.user_id)
    this.handleCloseDelete()
  }

  render() {
    const editActions = [
      <FlatButton label="Cancel" primary={true} onTouchTap={this.handleCloseEdit.bind(this)}/>,
      <FlatButton label="Update" primary={true} onTouchTap={this.submitFormEdit.bind(this)}/>,
    ]
    const deleteActions = [
      <FlatButton label="Cancel" primary={true} onTouchTap={this.handleCloseDelete.bind(this)}/>,
      <FlatButton label="Delete" primary={true} onTouchTap={this.submitDelete.bind(this)}/>,
    ]

    var organizationPath = [R.prop('user_organization', this.props.user), 'organization_name']
    let organization_name = R.pathOr('-', organizationPath, this.props.organizations)
    let initialValues = R.pipe(
      R.assoc('user_organization', organization_name), //Reformat organization
      R.pick(['user_firstname', 'user_lastname', 'user_email', 'user_organization', 'user_admin']) //Pickup only needed fields
    )(this.props.user)

    return (
      <div style={style}>
        <IconButton onClick={this.handlePopoverOpen.bind(this)}>
          <Icon name={Constants.ICON_NAME_NAVIGATION_MORE_VERT}/>
        </IconButton>
        <Popover open={this.state.openPopover} anchorEl={this.state.anchorEl}
                 onRequestClose={this.handlePopoverClose.bind(this)}>
          <Menu multiple={false}>
            <MenuItemLink label="Edit" onTouchTap={this.handleOpenEdit.bind(this)}/>
            <MenuItemButton label="Delete" onTouchTap={this.handleOpenDelete.bind(this)}/>
          </Menu>
        </Popover>
        <Dialog title="Confirmation" modal={false} open={this.state.openDelete}
                onRequestClose={this.handleCloseDelete.bind(this)}
                actions={deleteActions}>
          Do you confirm the removing of this user?
        </Dialog>
        <Dialog title="Update the user" modal={false} open={this.state.openEdit}
                onRequestClose={this.handleCloseEdit.bind(this)}
                actions={editActions}>
          <UserForm ref="userForm" initialValues={initialValues}
                    organizations={this.props.organizations}
                    onSubmit={this.onSubmitEdit.bind(this)}
                    userAdmin={this.props.user.user_admin}
                    onSubmitSuccess={this.handleCloseEdit.bind(this)}/>
        </Dialog>
      </div>
    )
  }
}

const select = (state) => {
  return {
    organizations: state.referential.entities.organizations
  }
}

UserPopover.propTypes = {
  user: PropTypes.object,
  updateUser: PropTypes.func,
  deleteUser: PropTypes.func,
  organizations: PropTypes.object,
  children: PropTypes.node
}

export default connect(select, {updateUser, deleteUser})(UserPopover)
