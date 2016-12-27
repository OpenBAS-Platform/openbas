import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import * as Constants from '../../constants/ComponentTypes'
import {AppBar} from '../../components/AppBar'
import {redirectToHome} from '../../actions/Application'
import {T} from '../../components/I18n'
import {i18nRegister} from '../../utils/Messages'

i18nRegister({
  fr: {
    'No worker available on this platform.': 'Aucun worker disponible sur cette plateforme.'
  }
})

const styles = {
  container: {
    padding: '90px 20px 0 20px',
    textAlign: 'center'
  },
  'noworker': {
    borderRadius: '5px',
    border: '3px solid #FF4081',
    padding: '20px',
    textAlign: 'center',
    fontSize: '18px',
    fontWeight: '600',
  },
  logo: {
    width: '40px',
    marginTop: '4px',
    cursor: 'pointer'
  }
}

class NoWorker extends Component {

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
          iconElementLeft={<img src="/images/logo_white.png" alt="logo" style={styles.logo}/>}
        />
        <div style={styles.container}>
          <div style={styles.noworker}>
            <T>No worker available on this platform.</T>
          </div>
        </div>
      </div>
    )
  }
}

NoWorker.propTypes = {
  redirectToHome: PropTypes.func
}

export default connect(null, {redirectToHome})(NoWorker);