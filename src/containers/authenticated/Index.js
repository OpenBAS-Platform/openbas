import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {Link} from 'react-router'
import {fetchExercises} from '../../actions/Exercise'
import {CircularSpinner} from '../../components/Spinner'
import * as Constants from '../../constants/ComponentTypes'
import {AppBar} from '../../components/AppBar'
import {Exercise} from '../../components/Exercise'
import CreateExercise from './CreateExercise'
import UserPopover from './UserPopover'
import {redirectToHome, toggleLeftBar} from '../../actions/Application'

const styles = {
  container: {
    textAlign: 'center'
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
    let loading;
    if (this.props.loading) {
      loading = <CircularSpinner />
    }

    return (
      <div style={styles.container}>
        <AppBar
          title="OpenEx"
          type={Constants.APPBAR_TYPE_TOPBAR_NOICON}
          onTitleTouchTap={this.redirectToHome.bind(this)}
          onLeftIconButtonTouchTap={this.toggleLeftBar.bind(this)}
          iconElementRight={<UserPopover/>}
          showMenuIconButton={false}/>
        { loading }
        {this.props.exercises.toList().map(exercise => {
          return (
            <Link to={'/private/exercise/' + exercise.get('exercise_id')} key={exercise.get('exercise_id')}>
              <Exercise
                name={exercise.get('exercise_name')}
                subtitle={exercise.get('exercise_subtitle')}
                description={exercise.get('exercise_description')}
                organizer={exercise.get('exercise_organizer')}
                organizerLogo="images/sgdsn.png"
                image={'images/' + exercise.get('exercise_id') + '.png'}
              />
            </Link>
          )
        })}
        <CreateExercise />
      </div>
    );
  }
}

IndexAuthenticated.propTypes = {
  loading: PropTypes.bool.isRequired,
  exercises: PropTypes.object,
  fetchExercises: PropTypes.func.isRequired,
  toggleLeftBar: PropTypes.func,
  logout: PropTypes.func,
  redirectToHome: PropTypes.func,
}

const select = (state) => {
  return {
    exercises: state.application.getIn(['entities', 'exercises']),
    loading: state.application.getIn(['ui', 'loading'])
  }
}

export default connect(select, {redirectToHome, toggleLeftBar, fetchExercises})(IndexAuthenticated);