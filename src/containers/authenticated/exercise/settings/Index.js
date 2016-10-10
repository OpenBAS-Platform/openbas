import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {updateExercise} from '../../../../actions/Exercise'
import {Paper} from '../../../../components/Paper'
import {Button} from '../../../../components/Button'
import {MenuItemLink} from '../../../../components/menu/MenuItem'
import * as Constants from '../../../../constants/ComponentTypes'
import ExerciseForm from '../ExerciseForm'
import StatusForm from './StatusForm'

const styles = {
  PaperContent: {
    padding: '20px'
  }
}

const statusesNames = {
  SCHEDULED: 'Scheduled',
  RUNNING: 'Running',
  FINISHED: 'Finished'
}

class Index extends Component {
  onUpdate(data) {
    this.props.updateExercise(this.props.id, data)
  }

  submitInformation() {
    this.refs.informationForm.submit()
  }

  submitStatus() {
    this.refs.statusForm.submit()
  }

  render() {
    let initialInformation = undefined
    let initialStatus = undefined
    let image = undefined

    if (this.props.exercise) {
      initialInformation = {
        exercise_name: this.props.exercise.get('exercise_name'),
        exercise_subtitle: this.props.exercise.get('exercise_subtitle'),
        exercise_description: this.props.exercise.get('exercise_description'),
        exercise_start_date: this.props.exercise.get('exercise_start_date'),
        exercise_end_date: this.props.exercise.get('exercise_end_date')
      }
      initialStatus = {
        exercise_status: this.props.exercise.get('exercise_status').get('status_id')
      }
      image = this.props.exercise.get('exercise_image')
    }

    return (
      <div>
        <Paper type={Constants.PAPER_TYPE_SETTINGS} zDepth={2}>
          <div style={styles.PaperContent}>
            <h2>Information</h2>
            <ExerciseForm
              ref="informationForm"
              onSubmit={this.onUpdate.bind(this)}
              initialValues={initialInformation }
            />
            <br />
            <Button type="submit" label="Update" onClick={this.submitInformation.bind(this)}/>
          </div>
        </Paper>
        <Paper type={Constants.PAPER_TYPE_SETTINGS} zDepth={2}>
          <div style={styles.PaperContent}>
            <h2>State</h2>
            <StatusForm
              ref="statusForm"
              onSubmit={this.onUpdate.bind(this)}
              items={this.props.exercise_statuses.toList().map(status => {
                return (
                  <MenuItemLink key={status.get('status_id')} value={status.get('status_id')} label={statusesNames[status.get('status_name')]} />
                )
              })}
              initialValues={initialStatus}
            />
            <Button type="submit" label="Update" onClick={this.submitStatus.bind(this)}/>
          </div>
        </Paper>
        <Paper type={Constants.PAPER_TYPE_SETTINGS} zDepth={2}>
          <div style={styles.PaperContent}>
            <h2>Image</h2>
            <br />
            <img src={image} alt="Exercise logo"/>
          </div>
        </Paper>
        <Paper type={Constants.PAPER_TYPE_SETTINGS} zDepth={2}>
          <div style={styles.PaperContent}>
            <h2>Delete</h2>
            <p>Deleting an exercise will result in deleting all the content of the exercise, including objectives,
              events, incidents, injects and audience groups. We do not recommend
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
  exercise_statuses: PropTypes.object,
  params: PropTypes.object,
  updateExercise: PropTypes.func
}

const select = (state, ownProps) => {
  let exerciseId = ownProps.params.exerciseId
  return {
    loading: state.application.getIn(['ui', 'loading']),
    id: exerciseId,
    exercise: state.application.getIn(['entities', 'exercises', exerciseId]),
    exercise_statuses: state.application.getIn(['entities', 'exercise_statuses'])
  }
}

export default connect(select, {updateExercise})(Index)
