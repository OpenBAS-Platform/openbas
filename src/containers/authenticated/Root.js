import React, {Component} from 'react'
import Rx from 'rx'
import {connect} from 'react-redux'
import {fetchWorkerStatus} from '../../actions/Application'
import {ONE_MINUTE} from '../../utils/Time'

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
        {this.props.children}
      </div>
    )
  }
}

RootAuthenticated.propTypes = {
  children: React.PropTypes.node,
  fetchWorkerStatus: React.PropTypes.func
}

export default connect(null, {fetchWorkerStatus})(RootAuthenticated)