import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {fetchExercises} from '../../actions/Exercise'
import {CircularSpinner} from '../../components/Spinner'
import * as Constants from '../../constants/ComponentTypes'
import {AppBar} from '../../components/AppBar'
import {Exercise} from '../../components/Exercise'
import UserPopover from './UserPopover'
import {redirectToHome, toggleLeftBar} from '../../actions/Application'

const styles = {
  container: {
    textAlign: 'center'
  }
}

class IndexAuthenticated extends Component {
  toggleLeftBar() {
    this.props.toggleLeftBar()
  }

  redirectToHome() {
    this.props.redirectToHome()
  }


  componentDidMount() {
    this.props.fetchExercises();
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
          type={Constants.APPBAR_TYPE_TOPBAR}
          onTitleTouchTap={this.redirectToHome.bind(this)}
          onLeftIconButtonTouchTap={this.toggleLeftBar.bind(this)}
          iconElementRight={<UserPopover/>}
          showMenuIconButton={false}/>
        { loading }
        {this.props.exercises.toList().map(exercise => {
          console.log(exercise)
          return (
            <a href={'/private/exercise/' + exercise.get('exercise_id')}>
              <Exercise
                key={exercise.get('exercise_id')}
                name={exercise.get('exercise_name')}
                subtitle={exercise.get('exercise_subtitle')}
                description={exercise.get('exercise_description')}
                organizer={exercise.get('exercise_organizer')}
                organizerLogo="images/sgdsn.png"
                image="images/secnuc16.jpg"
              />
          </a>
          )
        })}
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
    loading: state.home.get('loading')
  }
}

export default connect(select, {redirectToHome, toggleLeftBar, fetchExercises})(IndexAuthenticated);