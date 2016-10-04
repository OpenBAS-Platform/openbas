import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {askToken} from '../../../actions/Application'
import {Toolbar, ToolbarGroup, ToolbarTitle} from '../../../components/Toolbar'
import LoginForm from './LoginForm'
import {i18nRegister} from '../../../utils/Messages'
import * as Constants from '../../../constants/ComponentTypes'

i18nRegister({
  fr: {
    'Login': 'Identification'
  }
})

const styles = {
  login: {
    margin: '0 auto',
    marginTop: '50vh',
    transform: 'translateY(-60%)',
    textAlign: 'center',
    width: 400,
    border: '1px solid #ddd',
    borderRadius: 10,
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
        <Toolbar type={Constants.TOOLBAR_TYPE_LOGIN}>
          <ToolbarGroup>
            <ToolbarTitle text="Login"/>
          </ToolbarGroup>
        </Toolbar>
        <LoginForm onSubmit={this.onSubmit.bind(this)}/>
      </div>
    )
  }
}

Login.propTypes = {
  askToken: PropTypes.func
}

export default connect(null, {askToken})(Login);