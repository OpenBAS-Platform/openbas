import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import * as Constants from '../../../constants/ComponentTypes'
import {AppBar} from '../../../components/AppBar'
import UserPopover from '../UserPopover'
import {redirectToHome} from '../../../actions/Application'

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

class RootUser extends Component {
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
          iconElementLeft={<img src="../../images/logo_white.png" alt="logo" style={styles.logo}/>}
        />
        <div style={styles.container}>
          {this.props.children}
        </div>
      </div>
    );
  }
}

RootUser.propTypes = {
  toggleLeftBar: PropTypes.func,
  logout: PropTypes.func,
  redirectToHome: PropTypes.func,
  children: React.PropTypes.node
}

export default connect(null, {redirectToHome})(RootUser);