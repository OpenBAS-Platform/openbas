import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {fetchUsers} from '../actions/User';

class Home extends Component {
  componentDidMount() {
    this.props.fetchUsers();
  }

  render() {
    return (
      <div>
        Welcome {this.props.user_firstname}
      </div>
    );
  }
}

Home.propTypes = {
  user_firstname: PropTypes.string,
  fetchUsers: PropTypes.func.isRequired
}

const select = (state) => {
  var app = state.application;
  const isAuthenticated = app.hasIn(['token', 'token_id']) || false
  var user_firstname = app.getIn(['user', 'user_firstname']);
  return {
    isAuthenticated,
    user_firstname
  }
}

export default connect(select, {fetchUsers})(Home);