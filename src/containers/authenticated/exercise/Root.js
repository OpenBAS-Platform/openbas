import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {redirectToHome, toggleLeftBar} from '../../../actions/Application'
import * as Constants from '../../../constants/ComponentTypes'
import {AppBar} from '../../../components/AppBar'
import UserPopover from './../UserPopover'
import {fetchExercise} from '../../../actions/Exercise'

const styles = {
  root: {
    padding: '20px 20px 0 85px',
  },
  title: {
    marginLeft: 20,
    cursor: 'pointer'
  }
}

class RootAuthenticated extends Component {
  componentDidMount() {

    this.props.fetchExercise();
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
  userFirstname: PropTypes.string,
  userGravatar: PropTypes.string,
  toggleLeftBar: PropTypes.func,
  logout: PropTypes.func,
  redirectToHome: PropTypes.func,
  children: React.PropTypes.node,
  fetchExercise: PropTypes.func.isRequired,
  params: PropTypes.object
}

const select = (state) => {
  return {
    exercise: state.application.getIn(['exercise']),
    loading: state.application.getIn(['ui', 'loading'])
  }
}

export default connect(select, {redirectToHome, toggleLeftBar, fetchExercise})(RootAuthenticated)