import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {redirectToExercise, toggleLeftBar} from '../../../actions/Application'
import * as Constants from '../../../constants/ComponentTypes'
import {AppBar} from '../../../components/AppBar'
import {Chip} from '../../../components/Chip'
import {T} from '../../../components/I18n'
import R from 'ramda'
import NavBar from './nav/NavBar'
import LeftBar from './nav/LeftBar'
import UserPopover from './../UserPopover'
import {fetchExercise} from '../../../actions/Exercise'

const styles = {
  root: {
    padding: '80px 20px 0 85px',
  },
  title: {
    fontVariant: 'small-caps',
    display: 'block',
    float: 'left'
  }
}

class RootAuthenticated extends Component {
  componentDidMount() {
    this.props.fetchExercise(this.props.id)
  }

  toggleLeftBar() {
    this.props.toggleLeftBar()
  }

  redirectToExercise() {
    this.props.redirectToExercise(this.props.id)
  }

  render() {
    var exercise_status = R.path(['exercise', 'exercise_status'], this.props)
    const status_name = R.pathOr('-', [exercise_status, 'status_name'], this.props.exercise_statuses)

    return (
      <div>
        <AppBar
          title={
            <div>
              <span style={styles.title}>{R.path(['exercise', 'exercise_name'], this.props)}</span>
              <Chip backgroundColor="#C5CAE9" type={Constants.CHIP_TYPE_FLOATING}><T>{status_name}</T></Chip>
            </div>
          }
          type={Constants.APPBAR_TYPE_TOPBAR}
          onTitleTouchTap={this.redirectToExercise.bind(this)}
          onLeftIconButtonTouchTap={this.toggleLeftBar.bind(this)}
          iconElementRight={<UserPopover exerciseId={this.props.id}/>}
          showMenuIconButton={false}/>
        <NavBar id={this.props.id} pathname={this.props.pathname} />
        <LeftBar id={this.props.id} pathname={this.props.pathname}/>
        <div style={styles.root}>
          {this.props.children}
        </div>
      </div>
    )
  }
}

RootAuthenticated.propTypes = {
  id: PropTypes.string,
  pathname: PropTypes.string,
  leftBarOpen: PropTypes.bool,
  exercise: PropTypes.object,
  exercise_statuses: PropTypes.object,
  toggleLeftBar: PropTypes.func,
  logout: PropTypes.func,
  redirectToExercise: PropTypes.func,
  children: React.PropTypes.node,
  fetchExercise: PropTypes.func.isRequired,
  params: PropTypes.object
}

const select = (state, ownProps) => {
  let exerciseId = ownProps.params.exerciseId
  let pathname = ownProps.location.pathname
  return {
    id: exerciseId,
    pathname,
    exercise: R.prop(exerciseId, state.referential.entities.exercises),
    exercise_statuses: state.referential.entities.exercise_statuses
  }
}

export default connect(select, {redirectToExercise, toggleLeftBar, fetchExercise})(RootAuthenticated)