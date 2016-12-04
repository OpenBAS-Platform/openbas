import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import * as Constants from '../../../../constants/ComponentTypes'
import {addDryrun} from '../../../../actions/Dryrun'
import {Dialog} from '../../../../components/Dialog';
import {FlatButton, FloatingActionsButtonPlay} from '../../../../components/Button';
import DryrunForm from './DryrunForm'

class CreateDryrun extends Component {
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
    return this.props.addDryrun(this.props.exerciseId, data)
  }

  submitForm() {
    this.refs.dryrunForm.submit()
  }

  render() {
    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onTouchTap={this.handleClose.bind(this)}
      />,
      <FlatButton
        label="Launch"
        primary={true}
        onTouchTap={this.submitForm.bind(this)}
      />,
    ]

    return (
      <div>
        <FloatingActionsButtonPlay type={Constants.BUTTON_TYPE_FLOATING} onClick={this.handleOpen.bind(this)}/>
        <Dialog
          title="Launch a new dryrun"
          modal={false}
          open={this.state.open}
          onRequestClose={this.handleClose.bind(this)}
          actions={actions}
        >
          <DryrunForm ref="dryrunForm" audiences={this.props.audiences} onSubmit={this.onSubmit.bind(this)} onSubmitSuccess={this.handleClose.bind(this)}/>
        </Dialog>
      </div>
    )
  }
}

CreateDryrun.propTypes = {
  exerciseId: PropTypes.string,
  audiences: PropTypes.array,
  addDryrun: PropTypes.func
}

export default connect(null, {addDryrun})(CreateDryrun);