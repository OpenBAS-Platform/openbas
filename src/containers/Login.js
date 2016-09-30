import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {routerActions} from 'react-router-redux'
import {askToken} from '../actions/Application'
import LoginForm from '../forms/LoginForm'

class Login extends Component {

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

  onSubmit(data) {
    return this.props.askToken(data.username, data.password)
  }

  render() {
    return (
      <div className="Login">
        <LoginForm onSubmit={this.onSubmit.bind(this)}/>
      </div>
    )
  }
}

Login.propTypes = {
  askToken: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  replace: PropTypes.func.isRequired,
  redirect: PropTypes.string.isRequired
}

const select = (state, ownProps) => {
  const isAuthenticated = state.application.get('token') !== null
  const redirect = ownProps.location.query.redirect || '/';
  return {
    isAuthenticated,
    redirect
  }
}

export default connect(select, {askToken, replace: routerActions.replace})(Login);