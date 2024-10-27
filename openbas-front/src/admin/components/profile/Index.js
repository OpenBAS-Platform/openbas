import { useDispatch } from 'react-redux';
import * as R from 'ramda';
import { Button, Typography } from '@mui/material';
import { fetchOrganizations } from '../../../actions/Organization';
import { meTokens, renewToken, updateMeInformation, updateMePassword, updateMeProfile } from '../../../actions/User';
import UserForm from './UserForm';
import ProfileForm from './ProfileForm';
import PasswordForm from './PasswordForm';
import { useFormatter } from '../../../components/i18n';
import useDataLoader from '../../../utils/hooks/useDataLoader';
import { useHelper } from '../../../store';
import Paper from '../../../components/common/Paper';
import { countryOption } from '../../../utils/Option';

const Index = () => {
  const { t } = useFormatter();
  const dispatch = useDispatch();
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
      R.assoc(
        'user_country',
        data.user_country && data.user_country.id
          ? data.user_country.id
          : data.user_country,
      ),
    )(data);
    return dispatch(updateMeProfile(inputValues));
  };
  const onUpdateInformation = (data) => dispatch(updateMeInformation(data));
  const onUpdatePassword = (data) => dispatch(
    updateMePassword(data.user_current_password, data.user_plain_password),
  );
  const userOrganizationValue = organizationsMap[user.user_organization];
  const userOrganization = userOrganizationValue
    ? {
      id: userOrganizationValue.organization_id,
      label: userOrganizationValue.organization_name,
    }
    : null;
  const initialValues = R.pipe(
    R.assoc('user_organization', userOrganization),
    R.assoc('user_country', countryOption(user.user_country)),
    R.pick([
      'user_firstname',
      'user_lastname',
      'user_email',
      'user_organization',
      'user_country',
      'user_phone',
      'user_phone2',
      'user_pgp_key',
      'user_lang',
      'user_theme',
      'user_is_external',
    ]),
  )(user);
  const userToken = tokens.length > 0 ? R.head(tokens) : undefined;
  return (
    <div style={{ width: 800, margin: '0 auto' }}>
      <Paper>
        <Typography variant="h1" style={{ marginBottom: 20 }}>
          {t('Profile')}
        </Typography>
        <UserForm
          organizations={R.values(organizationsMap)}
          onSubmit={onUpdate}
          initialValues={initialValues}
        />
      </Paper>
      <Paper>
        <Typography variant="h1" style={{ marginBottom: 20 }}>
          {t('Information')}
        </Typography>
        <ProfileForm
          onSubmit={onUpdateInformation}
          initialValues={initialValues}
        />
      </Paper>
      {!initialValues.user_is_external && (
        <Paper>
          <Typography variant="h1" style={{ marginBottom: 20 }}>
            {t('Password')}
          </Typography>
          <PasswordForm onSubmit={onUpdatePassword} />
        </Paper>
      )}
      <Paper>
        <Typography variant="h1" style={{ marginBottom: 20 }}>
          {t('API access')}
        </Typography>
        <Typography variant="body1">
          {t(
            'The OpenBAS API relies on the REST standard. The token must be passed into the HTTP header',
          )}{' '}
          <strong>{t('Authorization')}</strong>.
        </Typography>
        <Typography
          variant="h4"
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
        <Typography
          variant="h4"
          gutterBottom={true}
          style={{ marginTop: 20 }}
        >
          {t('Example')}
        </Typography>
        {/* eslint-disable-next-line i18next/no-literal-string */}
        <pre>
          GET /api/exercises
          {/* eslint-disable-next-line i18next/no-literal-string */}
          <br />
          Content-Type: application/json
          {/* eslint-disable-next-line i18next/no-literal-string */}
          <br />
          Authorization: Bearer {userToken?.token_value}
        </pre>

        <Button
          variant="contained"
          color="primary"
          component="a"
          href="/swagger-ui/index.html"
        >
          {t('API specifications')}
        </Button>
      </Paper>
    </div>
  );
};

export default Index;
