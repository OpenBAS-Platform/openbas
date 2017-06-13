import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import R from 'ramda'
import {i18nRegister} from '../../../../../utils/Messages'
import {T} from '../../../../../components/I18n'
import {dateFormat, dateToISO} from '../../../../../utils/Time'
import Theme from '../../../../../components/Theme'
import * as Constants from '../../../../../constants/ComponentTypes'
import {Popover} from '../../../../../components/Popover'
import {Menu} from '../../../../../components/Menu'
import {Dialog, DialogTitleElement} from '../../../../../components/Dialog'
import {IconButton, FlatButton} from '../../../../../components/Button'
import {Icon} from '../../../../../components/Icon'
import {MenuItemLink, MenuItemButton} from "../../../../../components/menu/MenuItem"
import {Step, Stepper, StepLabel,} from '../../../../../components/Stepper'
import {fetchIncident, selectIncident} from '../../../../../actions/Incident'
import {downloadFile} from '../../../../../actions/File'
import {redirectToEvent} from '../../../../../actions/Application'
import {addInject, updateInject, deleteInject, tryInject, injectDone} from '../../../../../actions/Inject'
import InjectForm from './InjectForm'
import InjectContentForm from './InjectContentForm'
import InjectAudiences from './InjectAudiences'
import CopyForm from './CopyForm'

const styles = {
  [ Constants.INJECT_EXEC ]: {
    position: 'absolute',
    top: '8px',
    right: 0,
  },
  [ Constants.INJECT_SCENARIO ]: {
    position: 'absolute',
    top: '5px',
    right: 0,
  }
}

i18nRegister({
  fr: {
    '1. Parameters': '1. Paramètres',
    '2. Content': '2. Contenu',
    '3. Audiences': '3. Audiences',
    'Do you want to delete this inject?': 'Souhaitez-vous supprimer cette injection ?',
    'Enable': 'Activer',
    'Disable': 'Désactiver',
    'Test': 'Tester',
    'Do you want to test this inject?': 'Souhaitez-vous tester cette injection ?',
    'Do you want to disable this inject?': 'Souhaitez-vous désactiver cette injection ?',
    'Do you want to enable this inject?': 'Souhaitez-vous activer cette injection ?',
    'Mark as done': 'Marquer comme fait',
    'Done': 'Fait',
    'Do you want to mark this inject as done?': 'Souhaitez-vous marquer cette injection comme réalisée ?',
    'Inject test result': 'Résultat du test d\'inject',
    'Close': 'Fermer'
  }
})

class InjectPopover extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openDelete: false,
      openEdit: false,
      openPopover: false,
      openDisable: false,
      openEnable: false,
      openDone: false,
      openCopy: false,
      openTry: false,
      openResult: false,
      type: undefined,
      stepIndex: 0,
      finished: false,
      injectData: null,
      injectResult: false,
      injectAttachments: R.propOr([], 'attachments', this.readJSON(R.propOr(null, 'inject_content', this.props.inject)))
    }
  }

  readJSON(str) {
    try {
      return JSON.parse(str);
    } catch (e) {
      return null;
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
    this.setState({injectData: data})
  }

  onContentSubmit(data) {
    let injectData = this.state.injectData
    if (this.state.injectAttachments.length > 0) {
      data.attachments = this.state.injectAttachments
    }
    injectData.inject_content = JSON.stringify(data)
    this.setState({injectData: injectData})
  }

  onContentAttachmentAdd(file) {
    this.setState({injectAttachments: R.append(file, this.state.injectAttachments)})
  }

  onContentAttachmentDelete(name, event) {
    event.stopPropagation()
    this.setState({injectAttachments: R.filter(a => a.file_name !== name, this.state.injectAttachments)})
  }

  onAudiencesChange(data) {
    let injectData = this.state.injectData
    injectData.inject_audiences = data
    this.setState({injectData: injectData})
  }

  onSubaudiencesChange(data) {
    let injectData = this.state.injectData
    injectData.inject_subaudiences = data
    this.setState({injectData: injectData})
  }

  onSelectAllAudiences(value) {
    let injectData = this.state.injectData
    injectData.inject_all_audiences = value
    this.setState({injectData: injectData})
  }

  submitFormEdit() {
    if (this.state.stepIndex === 0) {
      this.refs.injectForm.submit()
    } else if (this.state.stepIndex === 1) {
      this.refs.contentForm.getWrappedInstance().submit()
    } else if (this.state.stepIndex === 2) {
      this.updateInject()
    }
  }

  updateInject() {
    let data = R.assoc('inject_date', dateToISO(this.state.injectData.inject_date), this.state.injectData)
    this.props.updateInject(this.props.exerciseId, this.props.eventId, this.props.incidentId, this.props.inject.inject_id, data)
    this.handleCloseEdit()
  }

  onInjectTypeChange(event, index, value) {
    this.setState({type: value})
  }

  handleOpenDelete() {
    this.setState({openDelete: true})
    this.handlePopoverClose()
  }

  handleCloseDelete() {
    this.setState({openDelete: false})
  }

  submitDelete() {
    this.props.deleteInject(this.props.exerciseId, this.props.eventId, this.props.incidentId, this.props.inject.inject_id).then(() => {
      this.props.fetchIncident(this.props.exerciseId, this.props.eventId, this.props.incidentId)
    })
    this.handleCloseDelete()
  }

  handleOpenDisable() {
    this.setState({openDisable: true})
    this.handlePopoverClose()
  }

  handleCloseDisable() {
    this.setState({openDisable: false})
  }

  submitDisable() {
    this.props.updateInject(this.props.exerciseId, this.props.eventId, this.props.incidentId, this.props.inject.inject_id, {'inject_enabled': false})
    this.handleCloseDisable()
  }

  handleOpenEnable() {
    this.setState({openEnable: true})
    this.handlePopoverClose()
  }

  handleCloseEnable() {
    this.setState({openEnable: false})
  }

  submitEnable() {
    this.props.updateInject(this.props.exerciseId, this.props.eventId, this.props.incidentId, this.props.inject.inject_id, {'inject_enabled': true})
    this.handleCloseEnable()
  }

  selectContent() {
    this.setState({stepIndex: 1})
  }

  selectAudiences() {
    this.setState({stepIndex: 2, finished: true})
  }

  handleOpenCopy() {
    this.setState({openCopy: true})
    this.handlePopoverClose()
  }

  handleCloseCopy() {
    this.setState({openCopy: false})
  }

  submitFormCopy() {
    this.refs.copyForm.submit()
  }

  handleOpenDone() {
    this.setState({openDone: true})
    this.handlePopoverClose()
  }

  handleCloseDone() {
    this.setState({openDone: false})
  }

  submitDone() {
    this.props.injectDone(this.props.inject.inject_id)
    this.handleCloseDone()
  }

  onCopySubmit(data) {
    let incident = R.find(i => i.incident_id === data.incident_id)(this.props.incidents)
    let audiencesList = R.map(a => a.audience_id, this.props.inject.inject_audiences)
    let subaudiencesList = R.map(a => a.audience_id, this.props.inject.inject_subaudiences)
    let new_inject = R.pipe(
      R.dissoc('inject_id'),
      R.dissoc('inject_event'),
      R.dissoc('inject_exercise'),
      R.dissoc('inject_incident'),
      R.dissoc('inject_status'),
      R.dissoc('inject_user'),
      R.dissoc('inject_users_number'),
      R.assoc('inject_title', this.props.inject.inject_title + ' (copy)'),
      R.assoc('inject_audiences', audiencesList),
      R.assoc('inject_subaudiences', subaudiencesList)
    )(this.props.inject)

    this.props.addInject(this.props.exerciseId, incident.incident_event.event_id, data.incident_id, new_inject).then(() => {
      this.props.fetchIncident(this.props.exerciseId, incident.incident_event.event_id, data.incident_id).then(() => {
        this.props.redirectToEvent(this.props.exerciseId, incident.incident_event.event_id)
      })
    })
    this.props.selectIncident(this.props.exerciseId, incident.incident_event.event_id, data.incident_id)
    this.handleCloseCopy()
  }

  handleOpenTry() {
    this.setState({openTry: true})
    this.handlePopoverClose()
  }

  handleCloseTry() {
    this.setState({openTry: false})
  }

  submitTry() {
    this.props.tryInject(this.props.exerciseId, this.props.eventId, this.props.incidentId, this.props.inject.inject_id).then((payload) => {
      this.setState({injectResult: payload.result, openResult: true})
    })
    this.handleCloseTry()
  }

  handleCloseResult() {
    this.setState({openResult: false})
  }

  downloadAttachment(file_id, file_name) {
    return this.props.downloadFile(file_id, file_name)
  }

  getStepContent(stepIndex, initialValues) {
    switch (stepIndex) {
      case 0:
        return (
          <InjectForm
            ref="injectForm"
            onSubmit={this.onGlobalSubmit.bind(this)}
            onSubmitSuccess={this.selectContent.bind(this)}
            initialValues={initialValues}
            onInjectTypeChange={this.onInjectTypeChange.bind(this)}
            types={this.props.inject_types}/>
        )
      case 1:
        return (
          <InjectContentForm
            ref="contentForm"
            initialValues={this.readJSON(initialValues.inject_content)}
            types={this.props.inject_types}
            type={this.state.type ? this.state.type : this.props.inject.inject_type}
            onSubmit={this.onContentSubmit.bind(this)}
            onSubmitSuccess={this.selectAudiences.bind(this)}
            onContentAttachmentAdd={this.onContentAttachmentAdd.bind(this)}
            onContentAttachmentDelete={this.onContentAttachmentDelete.bind(this)}
            downloadAttachment={this.downloadAttachment.bind(this)}
            attachments={this.state.injectAttachments}
          />
        )
      case 2:
        return (
          <InjectAudiences
            ref="injectAudiences"
            exerciseId={this.props.exerciseId}
            eventId={this.props.eventId}
            incidentId={this.props.incidentId}
            onChangeAudiences={this.onAudiencesChange.bind(this)}
            onChangeSubaudiences={this.onSubaudiencesChange.bind(this)}
            onChangeSelectAll={this.onSelectAllAudiences.bind(this)}
            injectId={this.props.inject.inject_id}
            injectAudiencesIds={this.props.injectAudiencesIds}
            injectSubaudiencesIds={this.props.injectSubaudiencesIds}
            audiences={this.props.audiences}
            subaudiences={this.props.subaudiences}
            selectAll={this.props.inject.inject_all_audiences}
          />
        )
      default:
        return 'Go away!'
    }
  }

  switchColor(disabled) {
    if (disabled) {
      return Theme.palette.disabledColor
    } else {
      return Theme.palette.textColor
    }
  }

  render() {
    const editActions = [
      <FlatButton label="Cancel" primary={true} onTouchTap={this.handleCloseEdit.bind(this)}/>,
      <FlatButton label={this.state.stepIndex === 2 ? "Update" : "Next"} primary={true}
                  onTouchTap={this.submitFormEdit.bind(this)}/>,
    ]
    const deleteActions = [
      <FlatButton label="Cancel" primary={true} onTouchTap={this.handleCloseDelete.bind(this)}/>,
      <FlatButton label="Delete" primary={true} onTouchTap={this.submitDelete.bind(this)}/>,
    ]
    const disableActions = [
      <FlatButton label="Cancel" primary={true} onTouchTap={this.handleCloseDisable.bind(this)}/>,
      <FlatButton label="Disable" primary={true} onTouchTap={this.submitDisable.bind(this)}/>,
    ]
    const enableActions = [
      <FlatButton label="Cancel" primary={true} onTouchTap={this.handleCloseEnable.bind(this)}/>,
      <FlatButton label="Enable" primary={true} onTouchTap={this.submitEnable.bind(this)}/>,
    ]
    const copyActions = [
      <FlatButton label="Cancel" primary={true} onTouchTap={this.handleCloseCopy.bind(this)}/>,
      <FlatButton label="Copy" primary={true} onTouchTap={this.submitFormCopy.bind(this)}/>,
    ]
    const tryActions = [
      <FlatButton label="Cancel" primary={true} onTouchTap={this.handleCloseTry.bind(this)}/>,
      <FlatButton label="Test" primary={true} onTouchTap={this.submitTry.bind(this)}/>,
    ]
    const doneActions = [
      <FlatButton label="Cancel" primary={true} onTouchTap={this.handleCloseDone.bind(this)}/>,
      <FlatButton label="Done" primary={true} onTouchTap={this.submitDone.bind(this)}/>,
    ]
    const resultActions = [
      <FlatButton label="Close" primary={true} onTouchTap={this.handleCloseResult.bind(this)}/>,
    ]

    let initPipe = R.pipe(
      R.assoc('inject_date', dateFormat(R.path(['inject', 'inject_date'], this.props))),
      R.pick(['inject_title', 'inject_description', 'inject_content', 'inject_date', 'inject_type'])
    )
    const initialValues = this.props.inject !== undefined ? initPipe(this.props.inject) : undefined
    let inject_enabled = R.propOr(true, 'inject_enabled', this.props.inject)
    let inject_type = R.propOr(true, 'inject_type', this.props.inject)
    let injectNotSupported = R.propOr(false, inject_type, this.props.inject_types) ? false : true

    return (
      <div style={styles[this.props.type]}>
        <IconButton onClick={this.handlePopoverOpen.bind(this)}>
          <Icon name={Constants.ICON_NAME_NAVIGATION_MORE_VERT}
                color={this.switchColor(!inject_enabled || injectNotSupported)}/>
        </IconButton>
        <Popover open={this.state.openPopover}
                 anchorEl={this.state.anchorEl}
                 onRequestClose={this.handlePopoverClose.bind(this)}>
          <Menu multiple={false}>
            {!injectNotSupported ?
              <MenuItemLink label="Edit" onTouchTap={this.handleOpenEdit.bind(this)}/> : ''}
            {!injectNotSupported && this.props.location !== 'run' ?
              <MenuItemLink label="Copy" onTouchTap={this.handleOpenCopy.bind(this)}/> : ''}
            {inject_enabled && !injectNotSupported ?
              <MenuItemButton label="Disable" onTouchTap={this.handleOpenDisable.bind(this)}/> : ''}
            {!inject_enabled && !injectNotSupported ?
              <MenuItemButton label="Enable" onTouchTap={this.handleOpenEnable.bind(this)}/> : ''}
            {inject_type === 'openex_manual' && this.props.location === 'run' ?
              <MenuItemButton label="Mark as done" onTouchTap={this.handleOpenDone.bind(this)}/> : ''}
            {!injectNotSupported ?
              <MenuItemButton label="Test" onTouchTap={this.handleOpenTry.bind(this)}/> : ''}
            <MenuItemButton label="Delete" onTouchTap={this.handleOpenDelete.bind(this)}/>
          </Menu>
        </Popover>
        <DialogTitleElement
          title="Confirmation"
          modal={false}
          open={this.state.openDelete}
          onRequestClose={this.handleCloseDelete.bind(this)}
          actions={deleteActions}>
          <T>Do you want to delete this inject?</T>
        </DialogTitleElement>
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
                  <T>2. Content</T>
                </StepLabel>
              </Step>
              <Step>
                <StepLabel>
                  <T>3. Audiences</T>
                </StepLabel>
              </Step>
            </Stepper>
          }
          autoScrollBodyContent={true}
          modal={false}
          open={this.state.openEdit}
          onRequestClose={this.handleCloseEdit.bind(this)}
          actions={editActions}>
          <div>{this.getStepContent(this.state.stepIndex, initialValues)}</div>
        </DialogTitleElement>
        <Dialog title="Confirmation" modal={false}
                open={this.state.openDisable}
                onRequestClose={this.handleCloseDisable.bind(this)}
                actions={disableActions}>
          <T>Do you want to disable this inject?</T>
        </Dialog>
        <Dialog title="Confirmation" modal={false}
                open={this.state.openEnable}
                onRequestClose={this.handleCloseEnable.bind(this)}
                actions={enableActions}>
          <T>Do you want to enable this inject?</T>
        </Dialog>
        <Dialog title="Done" modal={false}
                open={this.state.openDone}
                onRequestClose={this.handleCloseDone.bind(this)}
                actions={doneActions}>
          <T>Do you want to mark this inject as done?</T>
        </Dialog>
        <Dialog title="Copy" modal={false}
                open={this.state.openCopy}
                onRequestClose={this.handleCloseCopy.bind(this)}
                actions={copyActions}>
          <CopyForm ref="copyForm"
                    incidents={this.props.incidents}
                    onSubmit={this.onCopySubmit.bind(this)}
                    onSubmitSuccess={this.handleCloseCopy.bind(this)}/>
        </Dialog>
        <Dialog title="Test" modal={false}
                open={this.state.openTry}
                onRequestClose={this.handleCloseTry.bind(this)}
                actions={tryActions}>
          <T>Do you want to test this inject?</T>
        </Dialog>
        <Dialog title="Inject test result" modal={false}
                open={this.state.openResult}
                onRequestClose={this.handleCloseResult.bind(this)}
                actions={resultActions}>
          <div>
            <div><strong>{this.state.injectResult ? this.state.injectResult.status : ''}</strong></div>
            <br />
            {this.state.injectResult ? this.state.injectResult.message.map(line => {
              return <div key={Math.random()}>{line}</div>
            }) : ''}
          </div>
        </Dialog>
      </div>
    )
  }
}

InjectPopover.propTypes = {
  exerciseId: PropTypes.string,
  audiences: PropTypes.array,
  subaudiences: PropTypes.array,
  eventId: PropTypes.string,
  incidentId: PropTypes.string,
  inject: PropTypes.object,
  injectAudiencesIds: PropTypes.array,
  injectSubaudiencesIds: PropTypes.array,
  fetchIncident: PropTypes.func,
  addInject: PropTypes.func,
  updateInject: PropTypes.func,
  deleteInject: PropTypes.func,
  tryInject: PropTypes.func,
  redirectToEvent: PropTypes.func,
  selectIncident: PropTypes.func,
  injectDone: PropTypes.func,
  inject_types: PropTypes.object,
  children: PropTypes.node,
  initialAttachments: PropTypes.array,
  type: PropTypes.string,
  incidents: PropTypes.array,
  location: PropTypes.string,
  downloadFile: PropTypes.func
}

export default connect(null, {
  fetchIncident,
  addInject,
  updateInject,
  deleteInject,
  injectDone,
  tryInject,
  redirectToEvent,
  selectIncident,
  downloadFile
})(InjectPopover)
