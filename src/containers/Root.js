import React, {Component} from 'react';
import {Link} from 'react-router';
import {connect} from 'react-redux';
import logo from '../logo.svg';
import {logout} from '../actions/Application';

class Root extends Component {

  logoutClick() {
    this.props.logout();
    return false;
  }

  render() {
    let logoutButton;
    if (this.props.isAuthenticated) {
      logoutButton = <div>
        <br/>
        <span onClick={this.logoutClick.bind(this)}>Logout</span>
      </div>
    }

    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo"/>
          <h2>Welcome to OpenEx {this.props.username}</h2>
        </div>
        <Link to="home">Home</Link>
        <br/>
        <Link to="login">Login</Link>
        { logoutButton }
        {this.props.children}
      </div>
    )
  }
}

const select = (state, ownProps) => {
  const isAuthenticated = state.application.hasIn(['token', 'token_user']) || false
  var user_firstname = state.application.getIn(['token', 'token_user', 'user_firstname']);
  return {
    isAuthenticated,
    username: user_firstname
  }
}

export default connect(select, {logout})(Root);