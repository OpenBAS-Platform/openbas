import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import R from 'ramda'
import * as Constants from '../../../../../constants/ComponentTypes'
import {addInject, updateInject, deleteInject} from '../../../../../actions/Inject'
import {DialogTitleElement} from '../../../../../components/Dialog';
import {
  Step,
  Stepper,
  StepButton,
} from '../../../../../components/Stepper';
import {MenuItemLink} from '../../../../../components/menu/MenuItem'
import {FlatButton, FloatingActionsButtonCreate} from '../../../../../components/Button';
import InjectForm from './InjectForm'
import InjectContentForm from './InjectContentForm'
import InjectAudiences from './InjectAudiences'

class CreateInject extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      type: null,
      stepIndex: 0,
      finished: false,
      injectData: null
    }
  }

  handleOpen() {
    this.setState({open: true})
  }

  handleClose() {
    this.setState({open: false, stepIndex: 0, finished: false, searchTerm: '', injectData: null})
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

  handleNext() {
    if (this.state.stepIndex === 0) {
      this.refs.injectForm.submit()
    } else if (this.state.stepIndex === 1) {
      this.refs.contentForm.submit()
    } else if (this.state.stepIndex === 2) {
      this.createInject()
    }
  }

  createInject() {
    this.props.addInject(this.props.exerciseId, this.props.eventId, this.props.incidentId, this.state.injectData)
    this.handleClose()
  }

  changeType(event, index, value) {
    console.log('TYPE', value)
    this.setState({type: value})
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

  getStepContent(stepIndex) {
    switch (stepIndex) {
      case 0:
        return (
          <InjectForm
            ref="injectForm"
            onSubmit={this.onGlobalSubmit.bind(this)}
            onSubmitSuccess={this.selectContent.bind(this)}
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
            types={this.props.inject_types}
            type={this.state.type}
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
            injectId={this.props.lastId}
          />
        )
      default:
        return 'Go away!'
    }
  }

  render() {
    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onTouchTap={this.handleClose.bind(this)}
      />,
      <FlatButton
        label={this.state.stepIndex === 2 ? "Create" : "Next"}
        primary={true}
        onTouchTap={this.handleNext.bind(this)}
      />,
    ]

    return (
      <div>
        <FloatingActionsButtonCreate type={Constants.BUTTON_TYPE_FLOATING_PADDING} onClick={this.handleOpen.bind(this)}/>
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
          open={this.state.open}
          onRequestClose={this.handleClose.bind(this)}
          actions={actions}
        >
          <div>{this.getStepContent(this.state.stepIndex)}</div>
        </DialogTitleElement>
      </div>
    )
  }
}

CreateInject.propTypes = {
  exerciseId: PropTypes.string,
  eventId: PropTypes.string,
  incidentId: PropTypes.string,
  lastId: PropTypes.string,
  inject_types: PropTypes.object,
  addInject: PropTypes.func,
  updateInject: PropTypes.func,
  deleteInject: PropTypes.func,
}

export default connect(null, {addInject, updateInject, deleteInject})(CreateInject);