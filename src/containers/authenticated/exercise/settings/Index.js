import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import moment from 'moment'
import {Paper} from '../../../../components/Paper'
import {Button} from '../../../../components/Button'
import * as Constants from '../../../../constants/ComponentTypes'
import {fetchExercise} from '../../../../actions/Exercise'
import ExerciseForm from '../ExerciseForm'

const styles = {
  PaperContent: {
    padding: '20px'
  }
}

class Index extends Component {
  componentDidMount() {
    this.props.fetchExercise(this.props.id);
  }

  onSubmit(data) {
    this.props.updateExercise(data)
  }

  submitForm() {
    this.refs.exerciseForm.submit()
  }

  render() {
    console.log('EXERCISE', this.props.exercise)
    let name = this.props.exercise ? this.props.exercise.get('exercise_name') : 'dsqdsq'
    let startDate = this.props.exercise ? moment(this.props.exercise.get('exercise_start_date')).toDate() : new Date(2016, 1, 1, 1, 0, 0)
    let endDate = this.props.exercise ? moment(this.props.exercise.get('exercise_end_date')).toDate() : new Date(2016, 1, 1, 1, 0, 0)

    return (
      <div>
        <Paper type={Constants.PAPER_TYPE_SETTINGS}>
          <div style={styles.PaperContent}>
            <h2>Exercise information</h2>
            <ExerciseForm
              ref="exerciseForm"
              onSubmit={this.onSubmit.bind(this)}
              name="test"
              subtitle="Subtitle test"
              description="test"
              startDate={startDate}
              startTime={startDate}
              endDate={endDate}
              endTime={endDate}
            />
            <br />
            <Button type="submit" label="Update"/>
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
  fetchExercise: PropTypes.func.isRequired,
}

const select = (state, ownProps) => {
  let exerciseId = ownProps.params.exerciseId
  return {
    loading: state.application.getIn(['ui', 'loading']),
    id: exerciseId,
    exercise: state.application.getIn(['entities', 'exercises', exerciseId])
  }
}

export default connect(select, {fetchExercise})(Index)
