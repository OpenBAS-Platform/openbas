import React, {Component} from 'react'
import {connect} from 'react-redux'
import {i18nRegister} from '../../../utils/Messages'
import {T} from '../../../components/I18n'
import {redirectToAdmin, toggleLeftBar} from '../../../actions/Application'
import * as Constants from '../../../constants/ComponentTypes'
import {AppBar} from '../../../components/AppBar'
import NavBar from './nav/NavBar'
import LeftBar from './nav/LeftBar'
import UserPopover from './../UserPopover'
import PropTypes from 'prop-types'

i18nRegister({
  fr: {
    'Administratinon': 'Administration'
  }
})

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
              <span style={styles.title}><T>Administration</T></span>
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
  children: PropTypes.node,
  params: PropTypes.object
}

const select = (state, ownProps) => {
  let pathname = ownProps.location.pathname
  return {
    pathname,
  }
}

export default connect(select, {redirectToAdmin, toggleLeftBar})(RootAuthenticated)