import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {fetchExercises} from '../../actions/Exercise'
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from '../../components/Card';
import {CircularSpinner} from '../../components/Spinner'
import * as Constants from '../../constants/ComponentTypes'
import {AppBar} from '../../components/AppBar'
import UserPopover from './UserPopover'
import {connect} from 'react-redux'
import {redirectToHome, toggleLeftBar} from '../../actions/Application'

const cardMediaStyle = {
  height: 150
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
      <div>
        <AppBar
          title="OpenEx"
          type={Constants.APPBAR_TYPE_TOPBAR}
          onTitleTouchTap={this.redirectToHome.bind(this)}
          onLeftIconButtonTouchTap={this.toggleLeftBar.bind(this)}
          iconElementRight={<UserPopover/>}
          showMenuIconButton={false}/>

        { loading }
        {this.props.exercises.toList().map(exercise => {
          return (
            <Card>
              <CardHeader title={exercise.get('exercise_organizer')} />
              <CardMedia>
                <img src="images/secnuc16.jpg" style={cardMediaStyle}/>
              </CardMedia>
              <CardTitle title={exercise.get('exercise_name')} subtitle={exercise.get('exercise_subtitle')}/>
              <CardText>
                {exercise.get('exercise_description')}
              </CardText>
            </Card>
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