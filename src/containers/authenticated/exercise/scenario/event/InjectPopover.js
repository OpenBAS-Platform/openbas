import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import {Map} from 'immutable'
import moment from 'moment';
import * as Constants from '../../../../../constants/ComponentTypes'
import {Popover} from '../../../../../components/Popover';
import {Menu} from '../../../../../components/Menu'
import {Dialog} from '../../../../../components/Dialog'
import {IconButton, FlatButton} from '../../../../../components/Button'
import {Icon} from '../../../../../components/Icon'
import {MenuItemLink, MenuItemButton} from "../../../../../components/menu/MenuItem"
import {
  Step,
  Stepper,
  StepLabel,
} from '../../../../../components/Stepper';
import {updateInject, deleteInject} from '../../../../../actions/Inject'
import InjectForm from './InjectForm'
import InjectContentForm from './InjectContentForm'

const style = {
  float: 'left',
  marginTop: '-14px'
}

const types = Map({
  0: Map({
    type_id: "0",
    type_name: "EMAIL"
  }),
  1: Map({
    type_id: "1",
    type_name: "SMS"
  })
})

class InjectPopover extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openDelete: false,
      openEdit: false,
      openPopover: false,
      type: this.props.type,
      stepIndex: 0,
      finished: false,
      stepDisabled: false
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
      openEdit: false,
      stepIndex: 0,
      finished: false
    })
  }

  onGlobalSubmitEdit(data) {
    return this.props.updateInject(this.props.exerciseId, this.props.eventId, this.props.incidentId, this.props.injectId, data)
  }

  onContentSubmitEdit(data) {
    let injectData = Map({
      inject_content: JSON.stringify(data)
    })
    return this.props.updateInject(this.props.exerciseId, this.props.eventId, this.props.incidentId, this.props.injectId, injectData)
  }

  submitFormEdit() {
    if (this.state.stepIndex === 0) {
      this.refs.injectForm.submit()
    } else if (this.state.stepIndex === 1) {
      this.refs.contentForm.submit()
    }
  }

  changeType(event, index, value) {
    this.setState({type: value})
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
    this.props.deleteInject(this.props.exerciseId, this.props.eventId, this.props.incidentId, this.props.injectId)
    this.handleCloseDelete()
  }

  selectContent() {
    this.setState({
      stepIndex: 1,
      finished: true,
      stepDisabled: true
    })
  }

  getStepContent(stepIndex, initialInformation) {
    let initialContent = null
    switch (stepIndex) {
      case 0:
        return (
          <InjectForm
            ref="injectForm"
            onSubmit={this.onGlobalSubmitEdit.bind(this)}
            onSubmitSuccess={this.selectContent.bind(this)}
            initialValues={initialInformation}
            changeType={this.changeType.bind(this)}
            types={this.props.inject_types.toList().map(type => {
              return (
                <MenuItemLink key={type.get('type')} value={type.get('type')}
                              label={type.get('type')}/>
              )
            })}/>
        )
      case 1:
        initialContent = JSON.parse(initialInformation.inject_content)
        return (
          <InjectContentForm
            ref="contentForm"
            initialValues={initialContent}
            types={this.props.inject_types}
            type={this.state.type}
            onSubmit={this.onContentSubmitEdit.bind(this)}
            onSubmitSuccess={this.handleCloseEdit.bind(this)}/>
        )
      default:
        return 'Go away!';
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
        label={this.state.stepIndex === 0 ? "Next" : "Update"}
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
    if (this.props.inject) {
      initialInformation = {
        inject_title: this.props.inject.get('inject_title'),
        inject_description: this.props.inject.get('inject_description'),
        inject_content: this.props.inject.get('inject_content'),
        inject_date: moment(this.props.inject.get('inject_date')).format('YYYY-MM-DD HH:mm:ss'),
        inject_type: this.props.inject.get('inject_type')
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
          Do you confirm the removing of this inject?
        </Dialog>
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
          open={this.state.openEdit}
          onRequestClose={this.handleCloseEdit.bind(this)}
          actions={editActions}
        >
          <div>{this.getStepContent(this.state.stepIndex, initialInformation)}</div>
        </Dialog>
      </div>
    )
  }
}

const select = (state, props) => {
  let inject = state.application.getIn(['entities', 'injects', props.injectId])
  return {
    inject,
    type: inject.get('inject_type'),
    inject_types: state.application.getIn(['entities', 'inject_types']),
  }
}

InjectPopover.propTypes = {
  exerciseId: PropTypes.string,
  eventId: PropTypes.string,
  incidentId: PropTypes.string,
  injectId: PropTypes.string,
  type: PropTypes.string,
  updateInject: PropTypes.func,
  deleteInject: PropTypes.func,
  inject: PropTypes.object,
  inject_types: PropTypes.object,
  children: PropTypes.node
}

export default connect(select, {updateInject, deleteInject})(InjectPopover)