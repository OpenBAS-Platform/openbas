import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import {Map} from 'immutable'
import * as Constants from '../../../../../constants/ComponentTypes'
import {Popover} from '../../../../../components/Popover';
import {Menu} from '../../../../../components/Menu'
import {Dialog} from '../../../../../components/Dialog'
import {IconButton, FlatButton} from '../../../../../components/Button'
import {Icon} from '../../../../../components/Icon'
import {MenuItemLink, MenuItemButton} from "../../../../../components/menu/MenuItem"
import {updateIncident, deleteIncident} from '../../../../../actions/Incident'
import IncidentForm from './IncidentForm'

const typesNames = {
  TECHNICAL: 'Technical',
  OPERATIONAL: 'Operational',
  STRATEGIC: 'Strategic'
}

const style = {
  float: 'left',
  marginTop: '-14px'
}

class IncidentPopover extends Component {
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
    return this.props.updateIncident(this.props.exerciseId, this.props.eventId, this.props.incidentId, data)
  }

  submitFormEdit() {
    this.refs.incidentForm.submit()
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
    this.props.deleteIncident(this.props.exerciseId, this.props.eventId, this.props.incidentId)
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
    if (this.props.incident) {
      initialInformation = {
        incident_title: this.props.incident.get('incident_title'),
        incident_story: this.props.incident.get('incident_story'),
        incident_type: this.props.incident.get('incident_type')
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
          Do you confirm the deletion of this incident?
        </Dialog>
        <Dialog
          title="Update the incident"
          modal={false}
          open={this.state.openEdit}
          onRequestClose={this.handleCloseEdit.bind(this)}
          actions={editActions}
        >
          <IncidentForm ref="incidentForm"
                        initialValues={initialInformation}
                        onSubmit={this.onSubmitEdit.bind(this)}
                        onSubmitSuccess={this.handleCloseEdit.bind(this)}
                        types={this.props.incident_types.toList().map(type => {
                          return (
                            <MenuItemLink key={type.get('type_id')} value={type.get('type_id')}
                                          label={typesNames[type.get('type_name')]}/>
                          )
                        })}/>
        </Dialog>
      </div>
    )
  }
}

const select = (state, props) => {
  let incidents = state.application.getIn(['entities', 'incidents'])
  let currentIncident = state.application.getIn(['ui', 'states', 'current_incidents', props.exerciseId, props.eventId])
  let incident = currentIncident ? incidents.get(currentIncident) : Map()

  return {
    incident,
    incident_types: state.application.getIn(['entities', 'incident_types']),
  }
}

IncidentPopover.propTypes = {
  exerciseId: PropTypes.string,
  eventId: PropTypes.string,
  incidentId: PropTypes.string,
  deleteIncident: PropTypes.func,
  updateIncident: PropTypes.func,
  incident: PropTypes.object,
  incident_types: PropTypes.object,
  children: PropTypes.node
}

export default connect(select, {updateIncident, deleteIncident})(IncidentPopover)