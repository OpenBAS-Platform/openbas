import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import R from 'ramda'
import {i18nRegister} from '../../../../../utils/Messages'
import {T} from '../../../../../components/I18n'
import * as Constants from '../../../../../constants/ComponentTypes'
import {Popover} from '../../../../../components/Popover'
import {Menu} from '../../../../../components/Menu'
import {Dialog, DialogTitleElement} from '../../../../../components/Dialog'
import {IconButton, FlatButton} from '../../../../../components/Button'
import {Icon} from '../../../../../components/Icon'
import {MenuItemLink, MenuItemButton} from "../../../../../components/menu/MenuItem"
import {Step, Stepper, StepLabel,} from '../../../../../components/Stepper'
import {updateIncident, deleteIncident, selectIncident} from '../../../../../actions/Incident'
import IncidentForm from './IncidentForm'
import IncidentSubobjectives from './IncidentSubobjectives'

const styles = {
  container: {
    float: 'left',
    marginTop: '-14px'
  },
  'title': {
    float: 'left',
    width: '80%',
    padding: '5px 0 0 0'
  },
  'empty': {
    margin: '0 auto',
    marginTop: '10px',
    textAlign: 'center'
  }
}

i18nRegister({
  fr: {
    '1. Parameters': '1. Paramètres',
    '2. Subobjectives': '2. Sous-objectifs',
    'Update the incident': 'Modifier l\'incident',
    'Do you want to delete this incident?': 'Souhaitez-vous supprimer cet incident ?',
    'No subobjective found.': 'Aucun sous-objectif trouvé.',
    'Search for a subobjective': 'Rechercher un sous-objectif'
  }
})

class IncidentPopover extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openDelete: false,
      openEdit: false,
      openPopover: false,
      subobjectivesIds: this.props.incidentSubobjectivesIds,
      stepIndex: 0,
      finished: false,
      incidentData: null
    }
  }

  handlePopoverOpen(event) {
    event.stopPropagation()
    this.setState({openPopover: true, anchorEl: event.currentTarget})
  }

  handlePopoverClose() {
    this.setState({openPopover: false})
  }

  handleOpenEdit() {
    this.setState({openEdit: true})
    this.handlePopoverClose()
  }

  handleCloseEdit() {
    this.setState({openEdit: false, stepIndex: 0, finished: false, injectData: null})
  }

  onGlobalSubmit(data) {
    this.setState({incidentData: data})
  }

  onSubobjectivesChange(data) {
    let incidentData = this.state.incidentData
    incidentData.incident_subobjectives = data
    this.setState({incidentData: incidentData})
  }

  handleNext() {
    if (this.state.stepIndex === 0) {
      this.refs.incidentForm.submit()
    } else if (this.state.stepIndex === 1) {
      this.updateIncident()
    }
  }

  selectSubobjectives() {
    this.setState({stepIndex: 1, finished: true})
  }

  updateIncident() {
    this.props.updateIncident(this.props.exerciseId, this.props.eventId, this.props.incident.incident_id, this.state.incidentData)
    this.handleCloseEdit()
  }

  handleOpenDelete() {
    this.setState({openDelete: true})
    this.handlePopoverClose()
  }

  handleCloseDelete() {
    this.setState({openDelete: false})
  }

  submitDelete() {
    this.props.deleteIncident(this.props.exerciseId, this.props.eventId, this.props.incident.incident_id).then(() => {
      this.props.selectIncident(this.props.exerciseId, this.props.eventId, undefined)
    })
    this.handleCloseDelete()
  }

  getStepContent(stepIndex, initialValues) {
    switch (stepIndex) {
      case 0:
        return (
          <IncidentForm
            ref="incidentForm"
            initialValues={initialValues}
            onSubmit={this.onGlobalSubmit.bind(this)}
            onSubmitSuccess={this.selectSubobjectives.bind(this)}
            types={this.props.incident_types}/>
        )
      case 1:
        return (
          <IncidentSubobjectives
            ref="incidentSubobjectives"
            exerciseId={this.props.exerciseId}
            eventId={this.props.eventId}
            onChange={this.onSubobjectivesChange.bind(this)}
            subobjectives={this.props.subobjectives}
            incidentSubobjectivesIds={this.props.incidentSubobjectivesIds}
          />
        )
      default:
        return 'Go away!'
    }
  }

  render() {
    const editActions = [
      <FlatButton label="Cancel" primary={true} onTouchTap={this.handleCloseEdit.bind(this)}/>,
      <FlatButton label={this.state.stepIndex === 1 ? "Update" : "Next"} primary={true}
                  onTouchTap={this.handleNext.bind(this)}/>,
    ]
    const deleteActions = [
      <FlatButton label="Cancel" primary={true} onTouchTap={this.handleCloseDelete.bind(this)}/>,
      <FlatButton label="Delete" primary={true} onTouchTap={this.submitDelete.bind(this)}/>,
    ]

    let initialValues = R.pick(['incident_title', 'incident_story', 'incident_type', 'incident_weight', 'incident_order'], this.props.incident)

    return (
      <div style={styles.container}>
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
                onRequestClose={this.handleCloseDelete.bind(this)} actions={deleteActions}>
          <T>Do you want to delete this incident?</T>
        </Dialog>
        <DialogTitleElement
          title={
            <Stepper linear={false} activeStep={this.state.stepIndex}>
              <Step>
                <StepLabel>
                  <T>1. Parameters</T>
                </StepLabel>
              </Step>
              <Step>
                <StepLabel>
                  <T>2. Subobjectives</T>
                </StepLabel>
              </Step>
            </Stepper>
          }
          modal={false}
          open={this.state.openEdit}
          onRequestClose={this.handleCloseEdit.bind(this)}
          autoScrollBodyContent={true}
          actions={editActions}>
          <div>{this.getStepContent(this.state.stepIndex, initialValues)}</div>
        </DialogTitleElement>
      </div>
    )
  }
}

IncidentPopover.propTypes = {
  exerciseId: PropTypes.string,
  eventId: PropTypes.string,
  deleteIncident: PropTypes.func,
  updateIncident: PropTypes.func,
  selectIncident: PropTypes.func,
  fetchSubobjectives: PropTypes.func,
  incident: PropTypes.object,
  incident_types: PropTypes.object,
  incidentSubobjectivesIds: PropTypes.array,
  subobjectives: PropTypes.array
}

const select = (state) => {
  return {
    incident_types: state.referential.entities.incident_types,
  }
}

export default connect(select, {updateIncident, deleteIncident, selectIncident})(IncidentPopover)
