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
import {updateUser} from '../../../../actions/User'
import {updateAudience} from '../../../../actions/Audience'
import UserForm from '../../admin/users/UserForm'

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
    const user_ids = R.pipe(
      R.values,
      R.filter(a => a.user_id !== this.props.user.user_id),
      R.map(u => u.user_id)
    )(this.props.audience.audience_users)
    this.props.updateAudience(this.props.exerciseId, this.props.audience.audience_id, {audience_users: user_ids})
    this.handleCloseDelete()
  }

  render() {
    const editActions = [
      <FlatButton label="Cancel" primary={true} onTouchTap={this.handleCloseEdit.bind(this)}/>,
      <FlatButton label="Update" primary={true} onTouchTap={this.submitFormEdit.bind(this)}/>,
    ];
    const deleteActions = [
      <FlatButton label="Cancel" primary={true} onTouchTap={this.handleCloseDelete.bind(this)}/>,
      <FlatButton label="Delete" primary={true} onTouchTap={this.submitDelete.bind(this)}/>,
    ];
    
    var organizationPath = [R.prop('user_organization', this.props.user), 'organization_name']
    let organization_name = R.pathOr('-', organizationPath, this.props.organizations)
    let initialValues = R.pipe(
      R.assoc('user_organization', organization_name), //Reformat organization
      R.pick(['user_firstname', 'user_lastname', 'user_email', 'user_organization']) //Pickup only needed fields
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
  exerciseId: PropTypes.string,
  user: PropTypes.object,
  updateUser: PropTypes.func,
  updateAudience: PropTypes.func,
  audience: PropTypes.object,
  organizations: PropTypes.object,
  children: PropTypes.node
}

export default connect(select, {updateUser, updateAudience})(UserPopover)
