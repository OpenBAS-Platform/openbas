import React, {Component} from 'react';
import {connect} from 'react-redux';
import logo from '../logo.svg';
import {logout} from '../actions/Application';
import {Button, LinkButton} from '../components/Button'

class Root extends Component {

  logoutClick() {
    this.props.logout();
    return false;
  }

  render() {
    let logoutButton;
    if (this.props.isAuthenticated) {
      logoutButton = <Button label="Logout" onClick={this.logoutClick.bind(this)}/>
    }

    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo"/>
          <h2>Welcome to OpenEx {this.props.username}</h2>
        </div>
        <LinkButton label="Home" to="home"/>
        <br/>
        <LinkButton label="Login" to="login"/>
        <br/>
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