import React, {PropTypes, Component} from 'react'
import {connect} from 'react-redux'
import R from 'ramda'
import {i18nRegister} from '../../../../../utils/Messages'
import {T} from '../../../../../components/I18n'
import {dateFormat, dateToISO} from '../../../../../utils/Time'
import * as Constants from '../../../../../constants/ComponentTypes'
import {Popover} from '../../../../../components/Popover'
import {Menu} from '../../../../../components/Menu'
import {DialogTitleElement} from '../../../../../components/Dialog'
import {IconButton, FlatButton} from '../../../../../components/Button'
import {Icon} from '../../../../../components/Icon'
import {MenuItemLink, MenuItemButton} from "../../../../../components/menu/MenuItem"
import {Step, Stepper, StepLabel,} from '../../../../../components/Stepper'
import {fetchIncident} from '../../../../../actions/Incident'
import {fetchInjectTypes, updateInject, deleteInject} from '../../../../../actions/Inject'
import InjectForm from './InjectForm'
import InjectContentForm from './InjectContentForm'
import InjectAudiences from './InjectAudiences'

const style = {
  position: 'absolute',
  top: '5px',
  right: 0,
}

i18nRegister({
  fr: {
    '1. Parameters': '1. Paramètres',
    '2. Content': '2. Contenu',
    '3. Audiences': '3. Audiences',
    'Do you want to delete this inject?': 'Souhaitez-vous supprimer cet inject ?'
  }
})

class InjectPopover extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openDelete: false,
      openEdit: false,
      openPopover: false,
      type: undefined,
      stepIndex: 0,
      finished: false,
      injectData: null,
      injectAttachments: R.propOr([], 'attachments', JSON.parse(R.propOr(null, 'inject_content', this.props.inject)))
    }
  }

  handlePopoverOpen(event) {
    event.preventDefault()
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
    if( this.state.injectAttachments.length > 0 ) {
      data.attachments = this.state.injectAttachments
    }
    injectData.inject_content = JSON.stringify(data)
    this.setState({injectData: injectData})
  }

  onContentAttachmentAdd(name, url) {
    let attachment = {'file_name': name, 'file_url': url}
    this.setState({injectAttachments: R.append(attachment, this.state.injectAttachments)})
  }

  onContentAttachmentDelete(name) {
    this.setState({injectAttachments: R.filter(a => a.file_name !== name, this.state.injectAttachments)})
  }

  onAudiencesChange(data) {
    let injectData = this.state.injectData
    injectData.inject_audiences = data
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
    this.setState({
      openDelete: false
    })
  }

  submitDelete() {
    this.props.deleteInject(this.props.exerciseId, this.props.eventId, this.props.incidentId, this.props.inject.inject_id).then(() => {
      this.props.fetchIncident(this.props.exerciseId, this.props.eventId, this.props.incidentId)
    })
    this.handleCloseDelete()
  }

  selectContent() {
    this.setState({stepIndex: 1})
  }

  selectAudiences() {
    this.setState({stepIndex: 2, finished: true})
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
            initialValues={JSON.parse(initialValues.inject_content)}
            types={this.props.inject_types}
            type={this.state.type ? this.state.type : this.props.inject.inject_type}
            onSubmit={this.onContentSubmit.bind(this)}
            onSubmitSuccess={this.selectAudiences.bind(this)}
            onContentAttachmentAdd={this.onContentAttachmentAdd.bind(this)}
            onContentAttachmentDelete={this.onContentAttachmentDelete.bind(this)}
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
            onChange={this.onAudiencesChange.bind(this)}
            injectId={this.props.inject.inject_id}
            injectAudiencesIds={this.props.injectAudiencesIds}
            audiences={this.props.audiences}
          />
        )
      default:
        return 'Go away!'
    }
  }

  render() {
    const editActions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onTouchTap={this.handleCloseEdit.bind(this)}
      />,
      <FlatButton
        label={this.state.stepIndex === 2 ? "Update" : "Next"}
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

    let initPipe = R.pipe(
      R.assoc('inject_date', dateFormat(R.path(['inject', 'exercise_start_date'], this.props))),
      R.pick(['inject_title', 'inject_description', 'inject_content', 'inject_date', 'inject_type'])
    )
    const initialValues = this.props.inject !== undefined ? initPipe(this.props.inject) : undefined

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
          modal={false}
          open={this.state.openEdit}
          onRequestClose={this.handleCloseEdit.bind(this)}
          actions={editActions}>
          <div>{this.getStepContent(this.state.stepIndex, initialValues)}</div>
        </DialogTitleElement>
      </div>
    )
  }
}

InjectPopover.propTypes = {
  exerciseId: PropTypes.string,
  audiences: PropTypes.array,
  eventId: PropTypes.string,
  incidentId: PropTypes.string,
  inject: PropTypes.object,
  injectAudiencesIds: PropTypes.array,
  fetchIncident: PropTypes.func,
  updateInject: PropTypes.func,
  deleteInject: PropTypes.func,
  inject_types: PropTypes.object,
  children: PropTypes.node,
  initialAttachments: PropTypes.array
}

export default connect(null, {fetchIncident, fetchInjectTypes, updateInject, deleteInject})(InjectPopover)