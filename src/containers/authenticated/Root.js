import React, {Component} from 'react'
import Rx from 'rxjs/Rx'
import {connect} from 'react-redux'
import {fetchWorkerStatus} from '../../actions/Application'
import {savedDismiss} from '../../actions/Application'
import {Snackbar} from '../../components/Snackbar'
import {ONE_MINUTE} from '../../utils/Time'
import {T} from '../../components/I18n'
import {i18nRegister} from '../../utils/Messages'
import * as Constants from '../../constants/ComponentTypes'
import {Icon} from '../../components/Icon'
import DocumentTitle from '../../components/DocumentTitle'

i18nRegister({
  fr: {
    'Action done.': 'Action effectuée.'
  }
})

class RootAuthenticated extends Component {

  componentDidMount() {
    if (process.env.NODE_ENV !== 'development') {
      const initialStream = Rx.Observable.of(1); //Fetch on loading
      const intervalStream = Rx.Observable.interval(ONE_MINUTE) //Fetch every minute
      this.subscription = initialStream
        .merge(intervalStream)
        .exhaustMap(() => this.props.fetchWorkerStatus()) //Fetch only if previous call finished
        .subscribe()
    }
  }

  componentWillUnmount() {
    if (process.env.NODE_ENV !== 'development') {
      this.subscription.unsubscribe()
    }
  }

  render() {
    return (
      <DocumentTitle title='OpenEx - Crisis management exercises platform'>
        <div>
          <Snackbar open={this.props.savedPopupOpen} autoHideDuration={1500}
                    onRequestClose={this.props.savedDismiss.bind(this)} message={
            <div>
              <Icon name={Constants.ICON_NAME_ACTION_DONE} color="#ffffff" type={Constants.ICON_TYPE_LEFT}/>
              <T>Action done.</T>
            </div>}/>
          {this.props.children}
        </div>
      </DocumentTitle>
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