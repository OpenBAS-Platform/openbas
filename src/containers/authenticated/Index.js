import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {Link} from 'react-router'
import moment from 'moment'
import R from 'ramda'
import {fetchExercises} from '../../actions/Exercise'
import * as Constants from '../../constants/ComponentTypes'
import {AppBar} from '../../components/AppBar'
import {Exercise} from '../../components/Exercise'
import CreateExercise from './exercise/CreateExercise'
import UserPopover from './UserPopover'
import {redirectToHome} from '../../actions/Application'

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
          {this.props.exercises.length === 0 ? <div style={styles.empty}>You do not have any available exercise on this platform.</div>:""}
          {this.props.exercises.map(exercise => {
            var start_date = moment(exercise.exercise_start_date).format('MMM D, YYYY')
            var end_date = moment(exercise.exercise_end_date).format('MMM D, YYYY')
            return (
              <Link to={'/private/exercise/' + exercise.exercise_id} key={exercise.exercise_id}>
                <Exercise
                  name={exercise.exercise_name}
                  subtitle={exercise.exercise_subtitle}
                  description={exercise.exercise_description}
                  startDate={start_date}
                  endDate={end_date}
                  status={exercise.exercise_status}
                  organizer={exercise.exercise_organizer}
                  image={exercise.exercise_image.file_url}
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

const sortExercises = (exercises) => {
  let exercisesSorting = R.pipe(
    R.sort((a, b) => a.exercise_start_date > b.exercise_start_date)
  )
  return exercisesSorting(exercises)
}


IndexAuthenticated.propTypes = {
  exercises: PropTypes.array,
  fetchExercises: PropTypes.func,
  logout: PropTypes.func,
  redirectToHome: PropTypes.func,
}

const select = (state) => {
  return {
    exercises: sortExercises(R.values(state.referential.entities.exercises)),
  }
}

export default connect(select, {redirectToHome, fetchExercises})(IndexAuthenticated);