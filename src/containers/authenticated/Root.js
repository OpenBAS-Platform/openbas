import React, {Component} from 'react'
import Rx from 'rx'
import {connect} from 'react-redux'
import {fetchWorkerStatus} from '../../actions/Application'
import {savedDismiss} from '../../actions/Application'
import {Snackbar} from '../../components/Snackbar'
import {ONE_MINUTE} from '../../utils/Time'
import {T} from '../../components/I18n'
import {i18nRegister} from '../../utils/Messages'
import * as Constants from '../../constants/ComponentTypes'
import {Icon} from '../../components/Icon'

i18nRegister({
  fr: {
    'Data saved.': 'Données sauvegardées.'
  }
})

class RootAuthenticated extends Component {
  componentDidMount() {
    const initialStream = Rx.Observable.just(1); //Fetch on loading
    var intervalStream = Rx.Observable.interval(ONE_MINUTE) //Fetch every minute
    this.subscription = initialStream.merge(intervalStream).do(() => this.props.fetchWorkerStatus()).subscribe();
  }

  componentWillUnmount() {
    this.subscription.dispose();
  }

  render() {
    return (
      <div>
        <Snackbar open={this.props.savedPopupOpen} autoHideDuration={1500}
                  onRequestClose={this.props.savedDismiss.bind(this)} message={
          <div>
            <Icon name={Constants.ICON_NAME_ACTION_DONE} color="#ffffff" type={Constants.ICON_TYPE_LEFT}/>
            <T>Data saved.</T>
          </div>}/>
        {this.props.children}
      </div>
    )
  }
}

RootAuthenticated.propTypes = {
  children: React.PropTypes.node,
  savedPopupOpen: React.PropTypes.bool,
  fetchWorkerStatus: React.PropTypes.func,
  savedDismiss: React.PropTypes.func
}

const select = (state) => {
  return {
    savedPopupOpen: state.screen.saved || false,
  }
}

export default connect(select, {fetchWorkerStatus, savedDismiss})(RootAuthenticated)