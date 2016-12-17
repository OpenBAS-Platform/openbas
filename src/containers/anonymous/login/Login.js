import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {askToken} from '../../../actions/Application'
import {T} from '../../../components/I18n'
import {Toolbar, ToolbarGroup, ToolbarTitle} from '../../../components/Toolbar'
import LoginForm from './LoginForm'
import {i18nRegister} from '../../../utils/Messages'
import * as Constants from '../../../constants/ComponentTypes'

i18nRegister({
  fr: {
    'Login': 'Identification',
    'Use demo / demo to login.': 'Utiliser demo / demo pour s\'identifier.'
  }
})

const styles = {
  login: {
    margin: '0 auto',
    marginTop: '50vh',
    transform: 'translateY(-60%)',
    textAlign: 'center',
    width: '400px',
    border: '1px solid #ddd',
    borderRadius: '10px',
    paddingBottom: '20px'
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
            <ToolbarTitle text="Login" type={Constants.TOOLBAR_TYPE_LOGIN}/>
          </ToolbarGroup>
        </Toolbar>
        <LoginForm onSubmit={this.onSubmit.bind(this)}/>
        {this.props.demo === '1' ? <i><T>Use demo / demo to login.</T></i>:""}
      </div>
    )
  }
}

Login.propTypes = {
  demo: PropTypes.string,
  askToken: PropTypes.func
}

const select = (state, ownProps) => {
  let demo = ownProps.location.query.demo

  return {
    demo
  }
}


export default connect(select, {askToken})(Login);