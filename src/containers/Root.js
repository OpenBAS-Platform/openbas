import React, {Component} from 'react';
import {Link} from 'react-router';

import logo from '../logo.svg';

class Root extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo"/>
          <h2>Welcome to CEP</h2>
        </div>
        <Link to="home">Home</Link>
        <br/>
        <Link to="login">Login</Link>
        {this.props.children}
      </div>
    )
  }
}

export default Root;