import { Box, Checkbox, Paper } from '@mui/material';
import { useTheme, withStyles } from '@mui/styles';
import * as PropTypes from 'prop-types';
import * as R from 'ramda';
import { useEffect, useState } from 'react';
import Markdown from 'react-markdown';
import { connect } from 'react-redux';

import { askToken, checkKerberos, fetchPlatformParameters } from '../../../actions/Application';
import { storeHelper } from '../../../actions/Schema';
import inject18n from '../../../components/i18n';
import byFiligranDark from '../../../static/images/by_filigran_dark.png';
import byFiligranLight from '../../../static/images/by_filigran_light.png';
import logoDark from '../../../static/images/logo_text_dark.png';
import logoLight from '../../../static/images/logo_text_light.png';
import { fileUri } from '../../../utils/Environment';
import { isNotEmptyField } from '../../../utils/utils';
import LoginError from './LoginError';
import LoginForm from './LoginForm';
import LoginSSOButton from './LoginSSOButton';
import Reset from './Reset';

const styles = () => ({
  container: {
    textAlign: 'center',
    margin: '0 auto',
    width: '80%',
    paddingBottom: 50,
  },
  appBar: {
    borderTopLeftRadius: '10px',
    borderTopRightRadius: '10px',
  },
  login: {
    textAlign: 'center',
    margin: '0 auto',
    maxWidth: 500,
  },
  logo: {
    width: 400,
    margin: 0,
  },
  byFiligranLogo: {
    width: 100,
    margin: '-10px 0 0 295px',
  },
  paper: {
    margin: '0 auto',
    marginBottom: 20,
    padding: 10,
    textAlign: 'center',
    maxWidth: 500,
  },
});

const Login = (props) => {
  const theme = useTheme();
  const { classes, parameters, t } = props;
  const {
    auth_openid_enable: isOpenId,
    auth_saml2_enable: isSaml2,
    auth_local_enable: isLocal,
  } = parameters;
  const {
    platform_openid_providers: openidProviders,
    platform_saml2_providers: saml2Providers,
  } = parameters;
  const [reset, setReset] = useState(false);
  const [dimension, setDimension] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const updateWindowDimensions = () => setDimension(
    { width: window.innerWidth, height: window.innerHeight },
  );
  useEffect(() => {
    window.addEventListener('resize', updateWindowDimensions);
    return () => window.removeEventListener('resize', updateWindowDimensions);
  });
  useEffect(() => {
    props.fetchPlatformParameters();
    props.checkKerberos();
  }, []);
  const onSubmit = data => props.askToken(data.username, data.password);
  let loginHeight = 320;
  if ((isOpenId || isSaml2) && isLocal) {
    loginHeight = 440;
  } else if (isOpenId || isSaml2) {
    loginHeight = 190;
  }
  const marginTop = dimension.height / 2 - loginHeight / 2 - 100;
  const loginLogo = theme.palette.mode === 'dark'
    ? parameters?.platform_dark_theme?.logo_login_url
    : parameters?.platform_light_theme?.logo_login_url;

  const isWhitemarkEnable = parameters.platform_whitemark === 'true'
    && parameters.platform_enterprise_edition === 'true';

  // POLICIES
  const loginMessage = parameters.platform_policies?.platform_login_message;
  const consentMessage = parameters.platform_policies?.platform_consent_message;
  const consentConfirmText = parameters.platform_policies?.platform_consent_confirm_text
    ? parameters.platform_policies.platform_consent_confirm_text
    : t('I have read and comply with the above statement');
  const isLoginMessage = isNotEmptyField(loginMessage);
  const isConsentMessage = isNotEmptyField(consentMessage);
  const [checked, setChecked] = useState(false);
  const handleChange = () => {
    setChecked(!checked);
    // Auto scroll to bottom of unhidden/re-hidden login options.
    window.setTimeout(() => {
      const scrollingElement = document.scrollingElement ?? document.body;
      scrollingElement.scrollTop = scrollingElement.scrollHeight;
    }, 1);
  };

  return (
    <div
      data-testid="login-page"
      className={classes.container}
      style={{ marginTop }}
    >
      <img
        src={loginLogo && loginLogo.length > 0 ? loginLogo : fileUri(
          theme.palette.mode === 'dark' ? logoDark : logoLight,
        )}
        alt="logo"
        className={classes.logo}
        style={{ marginBottom: isWhitemarkEnable ? 20 : 0 }}
      />
      {!isWhitemarkEnable && (
        <div className={classes.byFiligran} style={{ marginBottom: 20 }}>
          <img
            src={fileUri(theme.palette.mode === 'dark'
              ? byFiligranDark
              : byFiligranLight)}
            className={classes.byFiligranLogo}
          />
        </div>
      )}
      {isLoginMessage && (
        <Paper classes={{ root: classes.paper }} variant="outlined">
          <Markdown>{loginMessage}</Markdown>
        </Paper>
      )}
      {isConsentMessage && (
        <Paper classes={{ root: classes.paper }} variant="outlined">
          <Markdown>{consentMessage}</Markdown>
          <Box display="flex" justifyContent="center" alignItems="center">
            <Markdown>{consentConfirmText}</Markdown>
            <Checkbox
              name="consent"
              edge="start"
              onChange={handleChange}
              style={{ margin: 0 }}
            >
            </Checkbox>
          </Box>
        </Paper>
      )}
      {(!isConsentMessage || (isConsentMessage && checked)) && (
        <>
          {isLocal && !reset && (
            <Paper variant="outlined" classes={{ root: classes.login }}>
              <LoginForm onSubmit={onSubmit} />
              <div style={{ marginBottom: 10, cursor: 'pointer' }}>
                <a onClick={() => setReset(true)}>
                  {t(
                    'I forgot my password',
                  )}
                </a>
              </div>
            </Paper>
          )}
          {isLocal && reset && <Reset onCancel={() => setReset(false)} />}
          <Box
            sx={{
              marginTop: 2.5,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2.5,
            }}
          >
            {(isOpenId || isSaml2) && [...(openidProviders ?? []),
              ...(saml2Providers ?? [])].map(
              provider => (
                <LoginSSOButton
                  key={provider.provider_name}
                  providerName={provider.provider_login}
                  providerUri={provider.provider_uri}
                />
              ),
            )}
            <LoginError />
          </Box>
        </>
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
  const helper = storeHelper(state);
  const parameters = helper.getPlatformSettings() ?? {};
  return { parameters };
};

export default R.compose(
  connect(select, { askToken, checkKerberos, fetchPlatformParameters }),
  inject18n,
  withStyles(styles),
)(Login);
