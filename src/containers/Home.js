import React, {Component} from 'react';
import {connect} from 'react-redux';

class Home extends Component {
  render() {
    return (
      <div>
        Welcome {this.props.user_firstname}
      </div>
    );
  }
}

const select = (state, ownProps) => {
  var app = state.application;
  const isAuthenticated = app.hasIn(['token', 'token_id']) || false
  var user_firstname = app.getIn(['user', 'user_firstname']);
  return {
    isAuthenticated,
    user_firstname
  }
}

export default connect(select)(Home);