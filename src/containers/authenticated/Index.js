import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {Link} from 'react-router'
import moment from 'moment';
import {fetchExercises} from '../../actions/Exercise'
import * as Constants from '../../constants/ComponentTypes'
import {AppBar} from '../../components/AppBar'
import {Exercise} from '../../components/Exercise'
import CreateExercise from './exercise/CreateExercise'
import UserPopover from './UserPopover'
import {redirectToHome, toggleLeftBar} from '../../actions/Application'

const styles = {
  container: {
    padding: '90px 20px 0 85px',
    textAlign: 'center'
  },
  empty: {
    marginTop: 40,
    fontSize: '18px',
    fontWeight: 500,
    textAlign: 'center'
  },
  logo: {
    width: '40px',
    marginTop: '4px',
    cursor: 'pointer'
  }
}

class IndexAuthenticated extends Component {
  componentDidMount() {
    this.props.fetchExercises();
  }

  toggleLeftBar() {
    this.props.toggleLeftBar()
  }

  redirectToHome() {
    this.props.redirectToHome()
  }

  render() {
    return (
      <div>
        <AppBar
          title="OpenEx"
          type={Constants.APPBAR_TYPE_TOPBAR_NOICON}
          onTitleTouchTap={this.redirectToHome.bind(this)}
          onLeftIconButtonTouchTap={this.redirectToHome.bind(this)}
          iconElementRight={<UserPopover/>}
          iconElementLeft={<img src="images/logo_white.png" alt="logo" style={styles.logo}/>}
        />
        <div style={styles.container}>
          {this.props.exercises.count() === 0 ? <div style={styles.empty}>You do not have any available exercise on this platform.</div>:""}
          {this.props.exercises.toList().map(exercise => {
            return (
              <Link to={'/private/exercise/' + exercise.get('exercise_id')} key={exercise.get('exercise_id')}>
                <Exercise
                  name={exercise.get('exercise_name')}
                  subtitle={exercise.get('exercise_subtitle')}
                  description={exercise.get('exercise_description')}
                  startDate={moment(exercise.get('exercise_start_date')).format('MMM D, YYYY')}
                  endDate={moment(exercise.get('exercise_end_date')).format('MMM D, YYYY')}
                  status={this.props.exercise_statuses.getIn([exercise.get('exercise_status'), 'status_name'])}
                  organizer={exercise.get('exercise_organizer')}
                  image={exercise.get('exercise_image').get('file_url')}
                />
              </Link>
            )
          })}
        </div>
        <CreateExercise />
      </div>
    );
  }
}

IndexAuthenticated.propTypes = {
  exercises: PropTypes.object,
  exercise_statuses: PropTypes.object,
  fetchExercises: PropTypes.func.isRequired,
  toggleLeftBar: PropTypes.func,
  logout: PropTypes.func,
  redirectToHome: PropTypes.func,
}

const select = (state) => {
  return {
    exercises: state.application.getIn(['entities', 'exercises']),
    exercise_statuses: state.application.getIn(['entities', 'exercise_statuses'])
  }
}

export default connect(select, {redirectToHome, toggleLeftBar, fetchExercises})(IndexAuthenticated);