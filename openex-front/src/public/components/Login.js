import React, { useEffect, useState } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import withStyles from '@mui/styles/withStyles';
import Paper from '@mui/material/Paper';
import * as R from 'ramda';
import Button from '@mui/material/Button';
import { VpnKeyOutlined } from '@mui/icons-material';
import logo from '../../resources/images/logo.png';
import {
  askToken,
  checkKerberos,
  fetchParameters,
} from '../../actions/Application';
import LoginForm from './LoginForm';
import inject18n from '../../components/i18n';

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
    borderRadius: '10px',
    paddingBottom: '15px',
  },
  logo: {
    width: 200,
    margin: '0px 0px 50px 0px',
  },
  subtitle: {
    color: '#ffffff',
    fontWeight: 400,
    fontSize: 18,
  },
});

const Login = (props) => {
  const { classes, t } = props;
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
    <div className={classes.container} style={{ marginTop }}>
      <img src={logo} alt="logo" className={classes.logo} />
      <Paper variant="outlined">
        <LoginForm onSubmit={onSubmit} />
      </Paper>
      {props.parameters.auth_openid_enable && (
        <Button
          component="a"
          href="/oauth2/authorization/citeum"
          variant="outlined"
          color="secondary"
          size="small"
          style={{ marginTop: 20 }}
          startIcon={<VpnKeyOutlined />}
        >
          {props.parameters.auth_openid_label.length > 0 ? (
            props.parameters.auth_openid_label
          ) : (
            <span>{t('Login with OpenID<')}</span>
          )}
        </Button>
      )}
    </div>
  );
};

Login.propTypes = {
  t: PropTypes.func,
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

export default R.compose(
  connect(select, { askToken, checkKerberos, fetchParameters }),
  inject18n,
  withStyles(styles),
)(Login);
