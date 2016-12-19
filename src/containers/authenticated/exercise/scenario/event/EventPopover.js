import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import R from 'ramda'
import {redirectToScenario} from '../../../../../actions/Application'
import * as Constants from '../../../../../constants/ComponentTypes'
import {Popover} from '../../../../../components/Popover';
import {Menu} from '../../../../../components/Menu'
import {Dialog} from '../../../../../components/Dialog'
import {IconButton, FlatButton} from '../../../../../components/Button'
import {Icon} from '../../../../../components/Icon'
import {MenuItemLink, MenuItemButton} from "../../../../../components/menu/MenuItem"
import {updateEvent, deleteEvent} from '../../../../../actions/Event'
import EventForm from './EventForm'

const style = {
  margin: '8px -30px 0 0'
}

class EventPopover extends Component {
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
    return this.props.updateEvent(this.props.exerciseId, this.props.eventId, data)
  }

  submitFormEdit() {
    this.refs.eventForm.submit()
  }

  handleOpenDelete() {
    this.setState({openDelete: true})
    this.handlePopoverClose()
  }

  handleCloseDelete() {
    this.setState({openDelete: false})
  }

  submitDelete() {
    this.props.deleteEvent(this.props.exerciseId, this.props.eventId).then(() => this.props.redirectToScenario(this.props.exerciseId))
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
    ]
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
    ]

    let initialValues = R.pick(['event_title', 'event_description'], this.props.event)
    return (
      <div style={style}>
        <IconButton onClick={this.handlePopoverOpen.bind(this)}>
          <Icon color="#ffffff" name={Constants.ICON_NAME_NAVIGATION_MORE_VERT}/>
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
          Do you confirm the deletion of this event?
        </Dialog>
        <Dialog
          title="Update the event"
          modal={false}
          open={this.state.openEdit}
          onRequestClose={this.handleCloseEdit.bind(this)}
          actions={editActions}
        >
          <EventForm
            ref="eventForm"
            initialValues={initialValues}
            onSubmit={this.onSubmitEdit.bind(this)}
            onSubmitSuccess={this.handleCloseEdit.bind(this)}
          />
        </Dialog>
      </div>
    )
  }
}

EventPopover.propTypes = {
  exerciseId: PropTypes.string,
  eventId: PropTypes.string,
  event: PropTypes.object,
  deleteEvent: PropTypes.func,
  updateEvent: PropTypes.func,
  redirectToScenario: PropTypes.func,
  children: PropTypes.node
}

export default connect(null, {updateEvent, deleteEvent, redirectToScenario})(EventPopover)