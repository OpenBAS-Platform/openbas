import React, {Component} from 'react';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import CounterElem from './components/Counter';
import * as CounterActions from './actions/CounterActions';

class CepApp extends Component {
  render() {
    const {count, lines, dispatch} = this.props;
    return (
      <CounterElem count={count} lines={lines} {...bindActionCreators(CounterActions, dispatch)} />
    );
  }
}

function select(state) {
  return {
    count: state.get('counter').get('count'),
    lines: state.get('counter').get('lines')
  };
}

export default connect(select)(CepApp);