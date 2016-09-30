import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {askToken} from '../../../actions/Application'
import LoginForm from './LoginForm'

class Login extends Component {

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
  askToken: PropTypes.func
}

export default connect(null, {askToken})(Login);