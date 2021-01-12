import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import { askToken, checkKerberos } from '../../../actions/Application';
import { T } from '../../../components/I18n';
import { Toolbar } from '../../../components/Toolbar';
import LoginForm from './LoginForm';
import { i18nRegister } from '../../../utils/Messages';
import * as Constants from '../../../constants/ComponentTypes';

i18nRegister({
  fr: {
    Login: 'Identification',
    'Login: demo@openex.io / Password: demo':
      "Nom d'utilisateur : demo@openex.io / Mot de passe : demo",
  },
});

const loginHeight = 250;

const styles = () => ({
  container: {
    textAlign: 'center',
    margin: '0 auto',
    width: 400,
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
          <Toolbar type={Constants.TOOLBAR_TYPE_LOGIN}>
            <Typography variant="h2" gutterBottom={true}>
              {<T>Login</T>}
            </Typography>
          </Toolbar>
          <LoginForm onSubmit={this.onSubmit.bind(this)} />
          {this.props.demo === '1' ? (
            <i>
              <T>Login: demo@openex.io / Password: demo</T>
            </i>
          ) : (
            ''
          )}
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
