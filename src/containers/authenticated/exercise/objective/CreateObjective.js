import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import * as Constants from '../../../../constants/ComponentTypes'
import {addObjective} from '../../../../actions/Objective'
import {Dialog} from '../../../../components/Dialog';
import {FlatButton, FloatingActionsButtonCreate} from '../../../../components/Button';
import ObjectiveForm from './ObjectiveForm'

class CreateObjective extends Component {
  constructor(props) {
    super(props);
    this.state = {open: false}
  }

  handleOpen() {
    this.setState({open: true})
  }

  handleClose() {
    this.setState({open: false})
  }

  onSubmit(data) {
    return this.props.addObjective(this.props.exerciseId, data)
  }

  submitForm() {
    this.refs.objectiveForm.submit()
  }

  render() {
    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onTouchTap={this.handleClose.bind(this)}
      />,
      <FlatButton
        label="Create"
        primary={true}
        onTouchTap={this.submitForm.bind(this)}
      />,
    ];

    return (
      <div>
        <FloatingActionsButtonCreate type={Constants.BUTTON_TYPE_FLOATING} onClick={this.handleOpen.bind(this)}/>
        <Dialog
          title="Create a new objective"
          modal={false}
          open={this.state.open}
          onRequestClose={this.handleClose.bind(this)}
          actions={actions}
        >
          <ObjectiveForm ref="objectiveForm" onSubmit={this.onSubmit.bind(this)} onSubmitSuccess={this.handleClose.bind(this)}/>
        </Dialog>
      </div>
    );
  }
}

CreateObjective.propTypes = {
  exerciseId: PropTypes.string,
  addObjective: PropTypes.func
}

export default connect(null, {addObjective})(CreateObjective);