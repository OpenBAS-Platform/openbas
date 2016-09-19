import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import logo from '../logo.svg';
import {logout} from '../actions/Application';
import {Button, LinkButton} from '../components/Button'

class Root extends Component {

  logoutClick() {
    this.props.logout();
  }

  render() {
    let loginButton, logoutButton;
    if (this.props.isAuthenticated) {
      logoutButton = <Button label="Logout" onClick={this.logoutClick.bind(this)}/>
    } else {
      loginButton = <LinkButton label="Login" to="login"/>
    }

    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo"/>
          <h2>Welcome to OpenEx {this.props.user_firstname}</h2>
        </div>
        <div>
          <LinkButton label="Index" to="/"/>
          <LinkButton label="Home" to="home"/>
          { loginButton }
          { logoutButton }
        </div>
        <div>
          {this.props.children}
        </div>
      </div>
    )
  }
}

Root.propTypes = {
  logout: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  user_firstname: PropTypes.string,
  children: React.PropTypes.node
}

const select = (state) => {
  var app = state.application;
  const isAuthenticated = app.get('token') !== undefined
  var user_firstname = app.getIn(['user', 'user_firstname']);
  return {
    isAuthenticated,
    user_firstname
  }
}

export default connect(select, {logout})(Root);