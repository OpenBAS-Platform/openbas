import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import * as Constants from '../../../../constants/ComponentTypes'
import {Popover} from '../../../../components/Popover';
import {Menu} from '../../../../components/Menu'
import {Dialog} from '../../../../components/Dialog'
import {IconButton, FlatButton} from '../../../../components/Button'
import {Icon} from '../../../../components/Icon'
import {MenuItemLink, MenuItemButton} from "../../../../components/menu/MenuItem"
import {updateSubobjective, deleteSubobjective} from '../../../../actions/Subobjective'
import SubobjectiveForm from './SubobjectiveForm'

const style = {
  position: 'absolute',
  top: '10px',
  right: 0,
}

class SubobjectivePopover extends Component {
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
    this.setState({
      openEdit: true
    })
    this.handlePopoverClose()
  }

  handleCloseEdit() {
    this.setState({
      openEdit: false
    })
  }

  onSubmitEdit(data) {
    return this.props.updateSubobjective(this.props.exerciseId, this.props.objectiveId, this.props.subobjectiveId, data)
  }

  submitFormEdit() {
    this.refs.subobjectiveForm.submit()
  }

  handleOpenDelete() {
    this.setState({
      openDelete: true
    })
    this.handlePopoverClose()
  }

  handleCloseDelete() {
    this.setState({
      openDelete: false
    })
  }

  submitDelete() {
    this.props.deleteSubobjective(this.props.exerciseId, this.props.objectiveId, this.props.subobjectiveId)
    this.handleCloseDelete()
  }

  render() {
    const editActions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onTouchTap={this.handleCloseEdit.bind(this)}
      />,
      <FlatButton
        label="Update"
        primary={true}
        onTouchTap={this.submitFormEdit.bind(this)}
      />,
    ];
    const deleteActions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onTouchTap={this.handleCloseDelete.bind(this)}
      />,
      <FlatButton
        label="Delete"
        primary={true}
        onTouchTap={this.submitDelete.bind(this)}
      />,
    ];

    let initialInformation = undefined
    if (this.props.subobjective) {
      initialInformation = {
        subobjective_title: this.props.subobjective.get('subobjective_title'),
        subobjective_description: this.props.subobjective.get('subobjective_description'),
        subobjective_priority: this.props.subobjective.get('subobjective_priority')
      }
    }

    return (
      <div style={style}>
        <IconButton onClick={this.handlePopoverOpen.bind(this)}>
          <Icon name={Constants.ICON_NAME_NAVIGATION_MORE_VERT}/>
        </IconButton>
        <Popover open={this.state.openPopover}
                 anchorEl={this.state.anchorEl}
                 onRequestClose={this.handlePopoverClose.bind(this)}>
          <Menu multiple={false}>
            <MenuItemLink label="Edit" onTouchTap={this.handleOpenEdit.bind(this)}/>
            <MenuItemButton label="Delete" onTouchTap={this.handleOpenDelete.bind(this)}/>
          </Menu>
        </Popover>
        <Dialog
          title="Confirmation"
          modal={false}
          open={this.state.openDelete}
          onRequestClose={this.handleCloseDelete.bind(this)}
          actions={deleteActions}
        >
          Do you confirm the deletion of this subobjective?
        </Dialog>
        <Dialog
          title="Update the subobjective"
          modal={false}
          open={this.state.openEdit}
          onRequestClose={this.handleCloseEdit.bind(this)}
          actions={editActions}
        >
          <SubobjectiveForm ref="subobjectiveForm" initialValues={initialInformation} onSubmit={this.onSubmitEdit.bind(this)} onSubmitSuccess={this.handleCloseEdit.bind(this)}/>
        </Dialog>
      </div>
    )
  }
}

const select = (state, props) => {
  let subobjectives = state.application.getIn(['entities', 'subobjectives'])
  let subobjective = subobjectives.get(props.subobjectiveId)

  return {
    subobjective
  }
}

SubobjectivePopover.propTypes = {
  exerciseId: PropTypes.string,
  objectiveId: PropTypes.string,
  subobjectiveId: PropTypes.string,
  deleteSubobjective: PropTypes.func,
  updateSubobjective: PropTypes.func,
  subobjective: PropTypes.object,
  children: PropTypes.node
}

export default connect(select, {updateSubobjective, deleteSubobjective})(SubobjectivePopover)