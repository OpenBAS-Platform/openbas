import React, { useEffect, useState } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import AppBar from '@material-ui/core/AppBar';
import * as R from 'ramda';
import Button from '@material-ui/core/Button';
import { VpnKeyOutlined } from '@material-ui/icons';
import {
  askToken,
  checkKerberos,
  fetchParameters,
} from '../../../actions/Application';
import { T } from '../../../components/I18n';
import LoginForm from './LoginForm';
import { i18nRegister } from '../../../utils/Messages';

i18nRegister({
  fr: {
    Login: 'Identification',
    'Login with OpenID': "S'authentifier avec OpenID",
  },
});

const styles = (theme) => ({
  container: {
    textAlign: 'center',
    margin: '0 auto',
    width: 400,
  },
  appBar: {
    borderTopLeftRadius: '10px',
    borderTopRightRadius: '10px',
  },
  button: {
    margin: theme.spacing(1),
    color: '#ffffff',
    backgroundColor: '#009688',
    '&:hover': {
      backgroundColor: '#00796b',
    },
  },
  login: {
    borderRadius: '10px',
    paddingBottom: '15px',
  },
  logo: {
    width: 300,
    margin: '0px 0px 20px 0px',
  },
  subtitle: {
    color: '#ffffff',
    fontWeight: 400,
    fontSize: 18,
  },
});

const Login = (props) => {
  const [dimension, setDimension] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const updateWindowDimensions = () => {
    setDimension({ width: window.innerWidth, height: window.innerHeight });
  };
  useEffect(() => {
    window.addEventListener('resize', updateWindowDimensions);
    return () => window.removeEventListener('resize', updateWindowDimensions);
  });
  useEffect(() => {
    props.fetchParameters();
    props.checkKerberos();
  }, []);
  const onSubmit = (data) => props.askToken(data.username, data.password);
  let loginHeight = 260;
  if (
    props.parameters.auth_openid_enable
    && props.parameters.auth_local_enable
  ) {
    loginHeight = 350;
  } else if (props.parameters.auth_openid_enable) {
    loginHeight = 150;
  }
  const marginTop = dimension.height / 2 - loginHeight / 2 - 200;
  return (
    <div className={props.classes.container} style={{ marginTop }}>
      <img
        src="/images/logo_openex.png"
        alt="logo"
        className={props.classes.logo}
      />
      <div
        className={props.classes.login}
        style={{
          height: loginHeight,
          border: props.parameters.auth_local_enable ? '1px solid #ddd' : 0,
        }}
      >
        {props.parameters.auth_local_enable && (
          <div>
            <AppBar
              color="primary"
              position="relative"
              className={props.classes.appBar}
            >
              <Toolbar>
                <div className={props.classes.subtitle}>{<T>Login</T>}</div>
              </Toolbar>
            </AppBar>
            <LoginForm onSubmit={onSubmit} />
          </div>
        )}
        {props.parameters.auth_openid_enable && (
          <Button
            component="a"
            href="/oauth2/authorization/citeum"
            variant="contained"
            color="primary"
            size="small"
            style={{ marginTop: 20 }}
            className={props.classes.button}
            startIcon={<VpnKeyOutlined />}
          >
            {props.parameters.auth_openid_label.length > 0 ? (
              props.parameters.auth_openid_label
            ) : (
              <T>Login with OpenID</T>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

Login.propTypes = {
  demo: PropTypes.string,
  askToken: PropTypes.func,
  checkKerberos: PropTypes.func,
  classes: PropTypes.object,
  parameters: PropTypes.object,
};

const select = (state) => {
  const parameters = R.propOr(
    {},
    'global',
    state.referential.entities.parameters,
  );
  return { parameters };
};

export default connect(select, { askToken, checkKerberos, fetchParameters })(
  withStyles(styles)(Login),
);
