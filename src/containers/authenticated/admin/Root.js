import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {redirectToAdmin, toggleLeftBar} from '../../../actions/Application'
import * as Constants from '../../../constants/ComponentTypes'
import {AppBar} from '../../../components/AppBar'
import NavBar from './nav/NavBar'
import LeftBar from './nav/LeftBar'
import UserPopover from './../UserPopover'

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
  toggleLeftBar() {
    this.props.toggleLeftBar()
  }

  redirectToHome() {
    this.props.redirectToAdmin()
  }

  render() {
    return (
      <div>
        <AppBar
          title={
            <div>
              <span style={styles.title}>Administration</span>
            </div>
          }
          type={Constants.APPBAR_TYPE_TOPBAR}
          onTitleTouchTap={this.redirectToHome.bind(this)}
          onLeftIconButtonTouchTap={this.toggleLeftBar.bind(this)}
          iconElementRight={<UserPopover/>}
          showMenuIconButton={false}/>
        <NavBar pathname={this.props.pathname} />
        <LeftBar pathname={this.props.pathname}/>
        <div style={styles.root}>
          {this.props.children}
        </div>
      </div>
    )
  }
}

RootAuthenticated.propTypes = {
  pathname: PropTypes.string,
  leftBarOpen: PropTypes.bool,
  toggleLeftBar: PropTypes.func,
  logout: PropTypes.func,
  redirectToAdmin: PropTypes.func,
  children: React.PropTypes.node,
  params: PropTypes.object
}

const select = (state, ownProps) => {
  let pathname = ownProps.location.pathname
  return {
    pathname,
  }
}

export default connect(select, {redirectToAdmin, toggleLeftBar})(RootAuthenticated)