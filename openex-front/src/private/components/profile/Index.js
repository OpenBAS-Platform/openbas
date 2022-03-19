import React from 'react';
import { useDispatch } from 'react-redux';
import { makeStyles } from '@mui/styles';
import * as R from 'ramda';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { fetchOrganizations } from '../../../actions/Organization';
import {
  updateMeProfile,
  updateMeInformation,
  updateMePassword,
  meTokens, renewToken,
} from '../../../actions/User';
import UserForm from './UserForm';
import ProfileForm from './ProfileForm';
import PasswordForm from './PasswordForm';
import { useFormatter } from '../../../components/i18n';
import useDataLoader from '../../../utils/ServerSideEvent';
import { useHelper } from '../../../store';

const useStyles = makeStyles((theme) => ({
  paper: {
    padding: 20,
    marginBottom: 40,
  },
  appBar: {
    width: '100%',
    zIndex: theme.zIndex.drawer + 1,
  },
  container: {
    padding: 20,
  },
  logo: {
    width: '40px',
    cursor: 'pointer',
  },
  title: {
    fontSize: 25,
    marginLeft: 20,
  },
  toolbar: theme.mixins.toolbar,
  documents: {
    color: '#ffffff',
    position: 'absolute',
    top: 8,
    right: 70,
  },
}));

const Index = () => {
  const { t } = useFormatter();
  const dispatch = useDispatch();
  const classes = useStyles();

  useDataLoader(() => {
    dispatch(fetchOrganizations());
    dispatch(meTokens());
  });

  const { user, tokens, organizationsMap } = useHelper((helper) => ({
    user: helper.getMe(),
    tokens: helper.getMeTokens(),
    organizationsMap: helper.getOrganizationsMap(),
  }));

  const onRenew = (tokenId) => dispatch(renewToken(tokenId));
  const onUpdate = (data) => {
    const inputValues = R.pipe(
      R.assoc(
        'user_organization',
        data.user_organization && data.user_organization.id
          ? data.user_organization.id
          : data.user_organization,
      ),
    )(data);
    return dispatch(updateMeProfile(inputValues));
  };
  const onUpdateInformation = (data) => dispatch(updateMeInformation(data));
  const onUpdatePassword = (data) => dispatch(updateMePassword(
    data.user_current_password,
    data.user_plain_password,
  ));

  const userOrganizationValue = organizationsMap[user.user_organization];
  const userOrganization = userOrganizationValue
    ? {
      id: userOrganizationValue.organization_id,
      label: userOrganizationValue.organization_name,
    }
    : null;
  const initialValues = R.pipe(
    R.assoc('user_organization', userOrganization),
    R.pick([
      'user_firstname',
      'user_lastname',
      'user_email',
      'user_organization',
      'user_phone',
      'user_phone2',
      'user_pgp_key',
      'user_lang',
      'user_theme',
    ]),
  )(user);
  const userToken = tokens.length > 0 ? R.head(tokens) : undefined;
  return (
    <div className={classes.container}>
      <div style={{ width: 800, margin: '0 auto' }}>
        <Paper variant="outlined" className={classes.paper}>
          <Typography variant="h5" style={{ marginBottom: 20 }}>
            {t('Profile')}
          </Typography>
          <UserForm
            organizations={R.values(organizationsMap)}
            onSubmit={onUpdate}
            initialValues={initialValues}
          />
        </Paper>
        <Paper variant="outlined" className={classes.paper}>
          <Typography variant="h5" style={{ marginBottom: 20 }}>
            {t('Information')}
          </Typography>
          <ProfileForm
            onSubmit={onUpdateInformation}
            initialValues={initialValues}
          />
        </Paper>
        <Paper variant="outlined" className={classes.paper}>
          <Typography variant="h5" style={{ marginBottom: 20 }}>
            {t('Password')}
          </Typography>
          <PasswordForm onSubmit={onUpdatePassword} />
        </Paper>
        <Paper variant="outlined" className={classes.paper}>
          <Typography variant="h5" style={{ marginBottom: 20 }}>
            {t('API access')}
          </Typography>
          <Typography variant="body1">
            {t(
              'The OpenEX API relies on the REST standard. The token must be passed into the HTTP header',
            )}{' '}
            <strong>Authorization</strong>.
            <Typography
              variant="h6"
              gutterBottom={true}
              style={{ marginTop: 20 }}
            >
              {t('Token key')}
            </Typography>
            <pre>{userToken?.token_value}</pre>
            <Button
                variant="contained"
                color="primary"
                component="a"
                onClick={() => onRenew(userToken?.token_id)}
            >
              {t('RENEW')}
            </Button>
            <Typography style={{ marginTop: 20 }} variant="h6" gutterBottom={true}>
              {t('Example')}
            </Typography>
            <pre>
              GET /api/exercises
              <br />
              Content-Type: application/json
              <br />
              Authorization: Bearer {userToken?.token_value}
            </pre>
          </Typography>
          <Typography variant="h6" gutterBottom={true}>
            {t('Documentation')}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            component="a"
            href="/swagger-ui/">
            {t('API specifications')}
          </Button>
        </Paper>
      </div>
    </div>
  );
};

export default Index;
