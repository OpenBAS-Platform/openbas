import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {Map} from 'immutable'
import * as Constants from '../../../../../constants/ComponentTypes'
import {addInject, updateInject, deleteInject} from '../../../../../actions/Inject'
import {Dialog} from '../../../../../components/Dialog';
import {
  Step,
  Stepper,
  StepLabel,
} from '../../../../../components/Stepper';
import {MenuItemLink} from '../../../../../components/menu/MenuItem'
import {FlatButton, FloatingActionsButtonCreate} from '../../../../../components/Button';
import InjectForm from './InjectForm'
import InjectContentForm from './InjectContentForm'

class CreateInject extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      type: null,
      stepIndex: 0,
      finished: false,
      stepDisabled: false
    }
  }

  handleOpen() {
    this.setState({open: true})
  }

  handleClose() {
    this.setState({stepIndex: 0, finished: false, open: false})
  }

  handleCancel() {
    if( this.state.stepIndex === 1 ) {
      this.props.deleteInject(this.props.exerciseId, this.props.eventId, this.props.incidentId, this.props.lastId)
    }
    this.handleClose()
  }

  onGlobalSubmit(data) {
    return this.props.addInject(this.props.exerciseId, this.props.eventId, this.props.incidentId, data)
  }

  onContentSubmit(data) {
    let injectData = Map({
      inject_content: JSON.stringify(data)
    })
    return this.props.updateInject(this.props.exerciseId, this.props.eventId, this.props.incidentId, this.props.lastId, injectData)
  }

  submitForm() {
    if (this.state.stepIndex === 0) {
      this.refs.injectForm.submit()
    } else if (this.state.stepIndex === 1) {
      this.refs.contentForm.submit()
    }
  }

  changeType(event, index, value) {
    this.setState({type: value})
  }

  selectContent() {
    this.setState({
      stepIndex: 1,
      finished: true,
      stepDisabled: true
    })
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
            types={this.props.inject_types.toList().map(type => {
              return (
                <MenuItemLink key={type.get('type')} value={type.get('type')}
                              label={type.get('type')}/>
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
            onSubmitSuccess={this.handleClose.bind(this)}/>
        )
      default:
        return 'Go away!';
    }
  }

  render() {
    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onTouchTap={this.handleCancel.bind(this)}
      />,
      <FlatButton
        label={this.state.stepIndex === 0 ? "Next" : "Create"}
        primary={true}
        onTouchTap={this.submitForm.bind(this)}
      />,
    ]

    return (
      <div>
        <FloatingActionsButtonCreate type={Constants.BUTTON_TYPE_FLOATING_PADDING}
                                     onClick={this.handleOpen.bind(this)}/>
        <Dialog
          title={
            <Stepper linear={true} activeStep={this.state.stepIndex}>
              <Step disabled={this.state.stepDisabled}>
                <StepLabel>
                  1. Global parameters
                </StepLabel>
              </Step>
              <Step>
                <StepLabel>
                  2. Content settings
                </StepLabel>
              </Step>
            </Stepper>
          }
          modal={false}
          open={this.state.open}
          onRequestClose={this.handleCancel.bind(this)}
          actions={actions}
        >
          <div>{this.getStepContent(this.state.stepIndex)}</div>
        </Dialog>
      </div>
    );
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
  deleteInject: PropTypes.func
}

const select = (state) => {
  return {
    lastId: state.application.getIn(['ui', 'states', 'lastId']),
    inject_types: state.application.getIn(['entities', 'inject_types']),
  }
}

export default connect(select, {addInject, updateInject, deleteInject})(CreateInject);