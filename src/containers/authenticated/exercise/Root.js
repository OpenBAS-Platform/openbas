import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {redirectToHome, toggleLeftBar} from '../../../actions/Application'
import * as Constants from '../../../constants/ComponentTypes'
import {AppBar} from '../../../components/AppBar'
import {Chip} from '../../../components/Chip'
import Theme from '../../../components/Theme'
import UserPopover from './../UserPopover'
import {fetchExercise} from '../../../actions/Exercise'

const styles = {
  root: {
    padding: '20px 20px 0 85px',
  },
  title: {
    fontVariant: 'small-caps',
    display: 'block',
    float: 'left'
  }
}

const statuses = {
  DRAFT: 'Scheduled',
  RUNNING: 'In exercise',
  FINISHED: 'Finished'
}

class RootAuthenticated extends Component {
  componentDidMount() {
    this.props.fetchExercise(this.props.id);
  }

  toggleLeftBar() {
    this.props.toggleLeftBar()
  }

  redirectToHome() {
    this.props.redirectToHome()
  }

  render() {
    let title = this.props.exercise ? this.props.exercise.get('exercise_name') : ''
    let status = this.props.exercise ? this.props.exercise.get('exercise_status').get('status_name') : 'Draft'
    return (
      <div>
        <AppBar
          title={<div><span style={styles.title}>{title}</span> <Chip backgroundColor="#C5CAE9" type={Constants.CHIP_TYPE_FLOATING}>{statuses[status]}</Chip></div>}
          type={Constants.APPBAR_TYPE_TOPBAR}
          onTitleTouchTap={this.redirectToHome.bind(this)}
          onLeftIconButtonTouchTap={this.toggleLeftBar.bind(this)}
          iconElementRight={<UserPopover/>}
          showMenuIconButton={false}/>
        <div style={styles.root}>
          {this.props.children}
        </div>
      </div>
    )
  }
}

RootAuthenticated.propTypes = {
  leftBarOpen: PropTypes.bool,
  exercise: PropTypes.object,
  userFirstname: PropTypes.string,
  userGravatar: PropTypes.string,
  toggleLeftBar: PropTypes.func,
  logout: PropTypes.func,
  redirectToHome: PropTypes.func,
  children: React.PropTypes.node,
  fetchExercise: PropTypes.func.isRequired,
  params: PropTypes.object
}

const select = (state, ownProps) => {
  let exerciseId = ownProps.params.exerciseId
  return {
    loading: state.application.getIn(['ui', 'loading']),
    id: exerciseId,
    exercise: state.application.getIn(['entities', 'exercises', exerciseId])
  }
}

export default connect(select, {redirectToHome, toggleLeftBar, fetchExercise})(RootAuthenticated)