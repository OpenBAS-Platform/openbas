import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import AppBar from '@material-ui/core/AppBar';
import { askToken, checkKerberos } from '../../../actions/Application';
import { T } from '../../../components/I18n';
import LoginForm from './LoginForm';
import { i18nRegister } from '../../../utils/Messages';

i18nRegister({
  fr: {
    Login: 'Identification',
  },
});

const loginHeight = 280;

const styles = () => ({
  container: {
    textAlign: 'center',
    margin: '0 auto',
    width: 400,
  },
  appBar: {
    borderTopLeftRadius: '10px',
    borderTopRightRadius: '10px',
  },
  login: {
    height: loginHeight,
    border: '1px solid #ddd',
    borderRadius: '10px',
    paddingBottom: '15px',
  },
  logo: {
    width: 150,
    margin: '0px 0px 20px 0px',
  },
  subtitle: {
    color: '#ffffff',
    fontWeight: 400,
    fontSize: 18,
  },
});

class Login extends Component {
  componentDidMount() {
    this.props.checkKerberos();
  }

  onSubmit(data) {
    return this.props.askToken(data.username, data.password);
  }

  render() {
    const { classes } = this.props;
    const paddingTop = window.innerHeight / 2 - loginHeight / 2 - 120;
    return (
      <div className={classes.container} style={{ paddingTop }}>
        <img src="images/logo_openex.png" alt="logo" className={classes.logo} />
        <div className={classes.login}>
          <AppBar
            color="primary"
            position="relative"
            className={classes.appBar}
          >
            <Toolbar>
              <div className={classes.subtitle}>{<T>Login</T>}</div>
            </Toolbar>
          </AppBar>
          <LoginForm onSubmit={this.onSubmit.bind(this)} />
        </div>
      </div>
    );
  }
}

Login.propTypes = {
  demo: PropTypes.string,
  askToken: PropTypes.func,
  checkKerberos: PropTypes.func,
  classes: PropTypes.object,
};

export default connect(null, { askToken, checkKerberos })(
  withStyles(styles)(Login),
);
