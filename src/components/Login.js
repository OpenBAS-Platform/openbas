import React, {Component} from 'react';
import {connect} from 'react-redux';
import {askToken} from '../actions/Application';

class Login extends Component {

  constructor(props) {
    super(props);
    this.state = {username: '', password: ''};
  }

  handleChange(event) {
    this.setState({[event.target.name]: event.target.value});
  }

  handleSubmit(e) {
    e.preventDefault();
    this.props.askToken(this.state.username, this.state.password);
  }

  render() {
    return (
      <div className="Login">
        <form className="loginForm" onSubmit={this.handleSubmit.bind(this)}>
          <input name="username" type="text" value={this.state.username}
                 onChange={this.handleChange.bind(this)}
                 placeholder="Your name"/>
          <input name="password" type="password" value={this.state.password}
                 onChange={this.handleChange.bind(this)}
                 placeholder="Your password"/>
          <input type="submit" value="Login"/>
        </form>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {}
}

const mapDispatchToProps = (dispatch) => {
  return {
    askToken: (username, password) => {
      dispatch(askToken(username, password))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);