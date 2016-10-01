import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {askToken} from '../../../actions/Application'
import {MyToolbar, MyToolbarGroup, MyToolbarTitle} from '../../../components/Toolbar'
import LoginForm from './LoginForm'
import {i18nRegister} from '../../../utils/Messages'

i18nRegister({
  fr: {
    'Login': 'Identification'
  }
})

const styles = {
  login: {
    margin: '0 auto',
    marginTop: '50vh',
    transform: 'translateY(-50%)',
    textAlign: 'center',
    width: 500,
    border: '1px solid #ddd',
    paddingBottom: 20
  }
}

class Login extends Component {

  onSubmit(data) {
    return this.props.askToken(data.username, data.password)
  }

  render() {
    return (
      <div style={styles.login}>
        <MyToolbar>
          <MyToolbarGroup>
            <MyToolbarTitle text="Login"/>
          </MyToolbarGroup>
        </MyToolbar>
        <LoginForm onSubmit={this.onSubmit.bind(this)}/>
      </div>
    )
  }
}

Login.propTypes = {
  askToken: PropTypes.func
}

export default connect(null, {askToken})(Login);