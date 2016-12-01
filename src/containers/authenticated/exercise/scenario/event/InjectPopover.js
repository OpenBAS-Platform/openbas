import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import R from 'ramda'
import moment from 'moment';
import * as Constants from '../../../../../constants/ComponentTypes'
import {Popover} from '../../../../../components/Popover';
import {Menu} from '../../../../../components/Menu'
import {DialogTitleElement} from '../../../../../components/Dialog'
import {IconButton, FlatButton} from '../../../../../components/Button'
import {Icon} from '../../../../../components/Icon'
import {MenuItemLink, MenuItemButton} from "../../../../../components/menu/MenuItem"
import {
  Step,
  Stepper,
  StepButton,
} from '../../../../../components/Stepper';
import {fetchInjectTypes, updateInject, deleteInject} from '../../../../../actions/Inject'
import InjectForm from './InjectForm'
import InjectContentForm from './InjectContentForm'
import InjectAudiences from './InjectAudiences'

const style = {
  position: 'absolute',
  top: '5px',
  right: 0,
}

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
      injectData: null
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
    this.setState({openEdit: false, stepIndex: 0, finished: false, searchTerm: '', injectData: null})
  }

  onGlobalSubmit(data) {
    this.setState({injectData: data})
  }

  onContentSubmit(data) {
    let injectData = this.state.injectData
    injectData.inject_content = JSON.stringify(data)
    this.setState({injectData: injectData})
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
      this.refs.contentForm.submit()
    } else if (this.state.stepIndex === 2) {
      this.updateInject()
    }
  }

  updateInject() {
    this.props.updateInject(this.props.exerciseId, this.props.eventId, this.props.incidentId, this.props.inject.inject_id, this.state.injectData)
    this.handleCloseEdit()
  }

  changeType(event, index, value) {
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
    this.props.deleteInject(this.props.exerciseId, this.props.eventId, this.props.incidentId, this.props.inject.inject_id)
    this.handleCloseDelete()
  }

  selectGlobal() {
    this.setState({stepIndex: 0})
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
            changeType={this.changeType.bind(this)}
            types={R.values(this.props.inject_types).map(type => {
              return (
                <MenuItemLink key={type.type} value={type.type} label={type.type}/>
              )
            })}/>
        )
      case 1:
        return (
          <InjectContentForm
            ref="contentForm"
            initialValues={JSON.parse(initialValues.inject_content)}
            types={this.props.inject_types}
            type={this.state.type ? this.state.type : this.props.inject.inject_type}
            onSubmit={this.onContentSubmit.bind(this)}
            onSubmitSuccess={this.selectAudiences.bind(this)}/>
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

    // inject_date: moment(this.props.inject.get('inject_date')).format('YYYY-MM-DD HH:mm:ss')
    let initialValues = R.pick(['inject_title', 'inject_description', 'inject_content', 'inject_date', 'inject_type'], this.props.inject)
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
          actions={deleteActions}
        >
          Do you confirm the removing of this inject?
        </DialogTitleElement>
        <DialogTitleElement
          title={
            <Stepper linear={false} activeStep={this.state.stepIndex}>
              <Step>
                <StepButton onClick={this.selectGlobal.bind(this)}>
                  1. Global parameters
                </StepButton>
              </Step>
              <Step>
                <StepButton onClick={this.selectContent.bind(this)}>
                  2. Content settings
                </StepButton>
              </Step>
              <Step>
                <StepButton onClick={this.selectAudiences.bind(this)}>
                  3. Audiences
                </StepButton>
              </Step>
            </Stepper>
          }
          modal={false}
          open={this.state.openEdit}
          onRequestClose={this.handleCloseEdit.bind(this)}
          actions={editActions}
        >
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
  updateInject: PropTypes.func,
  deleteInject: PropTypes.func,
  inject_types: PropTypes.object,
  children: PropTypes.node
}

export default connect(null, {fetchInjectTypes, updateInject, deleteInject})(InjectPopover)