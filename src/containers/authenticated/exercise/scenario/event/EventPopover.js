import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import * as R from 'ramda'
import {i18nRegister} from '../../../../../utils/Messages'
import {T} from '../../../../../components/I18n'
import {redirectToScenario} from '../../../../../actions/Application'
import * as Constants from '../../../../../constants/ComponentTypes'
import {Popover} from '../../../../../components/Popover'
import {Menu} from '../../../../../components/Menu'
import {Dialog} from '../../../../../components/Dialog'
import {IconButton, FlatButton} from '../../../../../components/Button'
import {Icon} from '../../../../../components/Icon'
import {MenuItemLink, MenuItemButton} from "../../../../../components/menu/MenuItem"
import {updateEvent, deleteEvent, importEvent} from '../../../../../actions/Event'
import EventForm from './EventForm'

const style = {
  margin: '8px -30px 0 0'
}

i18nRegister({
  fr: {
    'Update the event': 'Modifier l\'événement',
    'Do you want to delete this event?': 'Souhaitez-vous supprimer cet événement ?',
    'Import': 'Importer'
  }
})

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
    event.stopPropagation()
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

  openFileDialog() {
    this.refs.fileUpload.click()
  }

  handleFileChange() {
    let data = new FormData();
    data.append('file', this.refs.fileUpload.files[0])
    this.props.importEvent(this.props.exerciseId, this.props.eventId, data).then(() => this.props.reloadEvent())
    this.handlePopoverClose()
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

    let initialValues = R.pick(['event_title', 'event_description', 'event_order'], this.props.event)
    return (
      <div style={style}>
        <IconButton onClick={this.handlePopoverOpen.bind(this)}>
          <Icon color="#ffffff" name={Constants.ICON_NAME_NAVIGATION_MORE_VERT}/>
        </IconButton>
        <Popover open={this.state.openPopover}
                 anchorEl={this.state.anchorEl}
                 onRequestClose={this.handlePopoverClose.bind(this)}>
          <Menu multiple={false}>
            <MenuItemLink label="Import" onTouchTap={this.openFileDialog.bind(this)}/>
            <MenuItemLink label="Edit" onTouchTap={this.handleOpenEdit.bind(this)}/>
            <MenuItemButton label="Delete" onTouchTap={this.handleOpenDelete.bind(this)}/>
          </Menu>
          <input type="file" ref="fileUpload" style={{"display": "none"}} onChange={this.handleFileChange.bind(this)}/>
        </Popover>
        <Dialog
          title="Confirmation"
          modal={false}
          open={this.state.openDelete}
          onRequestClose={this.handleCloseDelete.bind(this)}
          actions={deleteActions}
        >
          <T>Do you want to delete this event?</T>
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
  importEvent: PropTypes.func,
  children: PropTypes.node,
  reloadEvent: PropTypes.func
}

export default connect(null, {updateEvent, deleteEvent, importEvent, redirectToScenario})(EventPopover)