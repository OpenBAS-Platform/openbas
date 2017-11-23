import React, {Component} from 'react'
import PropTypes from 'prop-types'
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
    'Login: demo@openex.io / Password: demo': 'Nom d\'utilisateur : demo@openex.io / Mot de passe : demo'
  }
})

const styles = {
  container: {
    textAlign: 'center',
    margin: '0 auto',
    marginTop: '50vh',
    transform: 'translateY(-60%)',
    width: '400px'
  },
  login: {
    border: '1px solid #ddd',
    borderRadius: '10px',
    paddingBottom: '15px'
  },
  logo: {
    width: '150px',
    margin: '0px 0px 20px 0px',
  }
}

class Login extends Component {
  componentDidMount() {
    this.props.askToken(null, null)
  }

  onSubmit(data) {
    return this.props.askToken(data.username, data.password)
  }

  render() {
    return (
      <div style={styles.container}>
        <img src="images/logo_openex.png" alt="logo" style={styles.logo}/>
        <div style={styles.login}>
          <Toolbar type={Constants.TOOLBAR_TYPE_LOGIN}>
            <ToolbarGroup>
              <ToolbarTitle text={<T>Login</T>} type={Constants.TOOLBAR_TYPE_LOGIN}/>
            </ToolbarGroup>
          </Toolbar>
          <LoginForm onSubmit={this.onSubmit.bind(this)}/>
          {this.props.demo === '1' ? <i><T>Login: demo@openex.io / Password: demo</T></i> : ""}
        </div>
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