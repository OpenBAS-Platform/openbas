import React, {Component} from 'react'
import {Dialog} from '../../components/Dialog';
import {FlatButton, FloatingActionsButtonCreate} from '../../components/Button';

import ExerciseForm from './exercise/ExerciseForm'

class CreateExercise extends Component {
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
    return this.props.createExercise(data)
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
        disabled={true}
        onTouchTap={this.handleClose.bind(this)}
      />,
    ];

    return (
      <div>
        <FloatingActionsButtonCreate onClick={this.handleOpen.bind(this)}/>
        <Dialog
          title="Create a new exercise"
          modal={false}
          open={this.state.open}
          onRequestClose={this.handleClose.bind(this)}
          actions={actions}
        >
          <ExerciseForm onSubmit={this.onSubmit.bind(this)} />
        </Dialog>
      </div>
    );
  }
}

export default CreateExercise