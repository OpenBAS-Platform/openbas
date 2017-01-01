import React, {Component, PropTypes} from 'react'
import Rx from 'rx'
import {connect} from 'react-redux'
import * as Constants from '../../constants/ComponentTypes'
import {AppBar} from '../../components/AppBar'
import {T} from '../../components/I18n'
import {i18nRegister} from '../../utils/Messages'
import {fetchWorkerStatus} from '../../actions/Application'
import {ONE_MINUTE} from '../../utils/Time'

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

  componentDidMount() {
    this.subscription = Rx.Observable.interval(ONE_MINUTE).do(() => this.props.fetchWorkerStatus()).subscribe();
  }

  componentWillUnmount() {
    this.subscription.dispose();
  }

  render() {
    return (
      <div>
        <AppBar title="OpenEx" type={Constants.APPBAR_TYPE_TOPBAR_NOICON}
          iconElementLeft={<img src="/images/logo_white.png" alt="logo" style={styles.logo}/>}/>
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
  fetchWorkerStatus: PropTypes.func
}

export default connect(null, {fetchWorkerStatus})(NoWorker);