import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {redirectToHome, toggleLeftBar} from '../../actions/Application'
import * as Constants from '../../constants/ComponentTypes'
import {AppBar} from '../../components/AppBar'
import UserPopover from './UserPopover'
import NavBar from './nav/NavBar'
import LeftBar from './nav/LeftBar'

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
  constructor(props) {
    super(props);
    this.state = {
      menu_right_open: false,
    }
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
          iconElementRight={<UserPopover/>}/>
        <NavBar />
        <LeftBar />
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
  children: React.PropTypes.node
}

export default connect(null, {redirectToHome, toggleLeftBar})(RootAuthenticated)