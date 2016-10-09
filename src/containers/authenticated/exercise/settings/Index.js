import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {Paper} from '../../../../components/Paper'
import {Button} from '../../../../components/Button'
import * as Constants from '../../../../constants/ComponentTypes'
import ExerciseForm from '../ExerciseForm'
import StatusForm from './StatusForm'

const styles = {
  PaperContent: {
    padding: '20px'
  }
}

class Index extends Component {
  onUpdate(data) {
    this.props.updateExercise(data)
  }

  render() {
    console.log('EXERCISE', this.props.exercise)
    let image = this.props.exercise ? this.props.exercise.get('exercise_image') : ''

    return (
      <div>
        <Paper type={Constants.PAPER_TYPE_SETTINGS} zDepth={2}>
          <div style={styles.PaperContent}>
            <h2>Information</h2>
            <ExerciseForm
              ref="exerciseForm"
              onSubmit={this.onUpdate.bind(this)}
              initialValues={this.props.exercise ? this.props.exercise.toJS() : ''}
            />
            <br />
            <Button type="submit" label="Update"/>
          </div>
        </Paper>
        <Paper type={Constants.PAPER_TYPE_SETTINGS} zDepth={2}>
          <div style={styles.PaperContent}>
            <h2>State</h2>
            <StatusForm
              ref="statusForm"
              onSubmit={this.onUpdate.bind(this)}
              initialValues={this.props.exercise ? this.props.exercise.get('exercise_status').toJS() : ''}
            />
            <Button type="submit" label="Update"/>
          </div>
        </Paper>
        <Paper type={Constants.PAPER_TYPE_SETTINGS} zDepth={2}>
          <div style={styles.PaperContent}>
            <h2>Image</h2>
            <br />
            <img src={image} alt="Exercise logo" />
          </div>
        </Paper>
        <Paper type={Constants.PAPER_TYPE_SETTINGS} zDepth={2}>
          <div style={styles.PaperContent}>
            <h2>Delete</h2>
            <p>Deleting an exercise will result in deleting all the content of the exercise, including objectives, events, incidents, injects and audience groups. We do not recommend
            you do this.</p>
            <Button type="submit" label="Delete"/>
          </div>
        </Paper>
      </div>
    );
  }
}

Index.propTypes = {
  id: PropTypes.string,
  exercise: PropTypes.object,
  params: PropTypes.object,
}

const select = (state, ownProps) => {
  let exerciseId = ownProps.params.exerciseId
  return {
    loading: state.application.getIn(['ui', 'loading']),
    id: exerciseId,
    exercise: state.application.getIn(['entities', 'exercises', exerciseId])
  }
}

export default connect(select, null)(Index)
