import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import * as Constants from '../../../constants/ComponentTypes'
import {i18nRegister} from '../../../utils/Messages'
import {addExercise} from '../../../actions/Exercise'
import {Dialog} from '../../../components/Dialog'
import {FlatButton, FloatingActionsButtonCreate} from '../../../components/Button'
import ExerciseForm from './ExerciseForm'

i18nRegister({
  fr: {
    'Create a new exercise': 'Créer un exercice'
  }
})

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
    return this.props.addExercise(data)
  }

  submitForm() {
    this.refs.exerciseForm.submit()
  }

  render() {
    const actions = [
      <FlatButton label="Cancel" primary={true} onClick={this.handleClose.bind(this)}/>,
      <FlatButton label="Create" primary={true} onClick={this.submitForm.bind(this)}/>,
    ]

    return (
      <div>
        <FloatingActionsButtonCreate type={Constants.BUTTON_TYPE_FLOATING} onClick={this.handleOpen.bind(this)}/>
        <Dialog title="Create a new exercise" modal={false}
          open={this.state.open}
          onRequestClose={this.handleClose.bind(this)}
          actions={actions}>
          <ExerciseForm ref="exerciseForm" onSubmit={this.onSubmit.bind(this)}
                        onSubmitSuccess={this.handleClose.bind(this)}/>
        </Dialog>
      </div>
    )
  }
}

CreateExercise.propTypes = {
  addExercise: PropTypes.func
}

export default connect(null, {addExercise})(CreateExercise);