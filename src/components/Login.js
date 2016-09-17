import React, {Component} from 'react'
import {connect} from 'react-redux'
import {routerActions} from 'react-router-redux'
import {askToken} from '../actions/Application'
import {Button} from './Button'
import {Field} from './Field'

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

  //region handle login state

  componentWillMount() {
    const {isAuthenticated, replace, redirect} = this.props
    if (isAuthenticated) {
      replace(redirect)
    }
  }

  componentWillReceiveProps(nextProps) {
    const {isAuthenticated, redirect} = nextProps
    const {isAuthenticated: wasAuthenticated, replace} = this.props
    if (!wasAuthenticated && isAuthenticated) {
      replace(redirect)
    }
  }

  //endregion

  render() {
    return (
      <div className="Login">
        <form className="loginForm" onSubmit={this.handleSubmit.bind(this)}>
          <Field name="username" label="Username" hint="Your name"
                 value={this.state.username}
                 onChange={this.handleChange.bind(this)}/>
          <br/>

          <Field name="password" type="password" label="Password" hint="Your password"
                 value={this.state.password}
                 onChange={this.handleChange.bind(this)}/>
          <br/>
          <Button type="submit" label="Login"/>
        </form>
      </div>
    )
  }
}

const select = (state, ownProps) => {
  const isAuthenticated = state.application.hasIn(['token', 'token_user']) || false
  const redirect = ownProps.location.query.redirect || '/'
  return {
    isAuthenticated,
    redirect
  }
}

export default connect(select, {askToken, replace: routerActions.replace})(Login);