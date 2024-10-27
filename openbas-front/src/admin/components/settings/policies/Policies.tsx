import { FunctionComponent } from 'react';
import { Grid, Paper, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useFormatter } from '../../../../components/i18n';
import Breadcrumbs from '../../../../components/Breadcrumbs';
import SecurityMenu from '../SecurityMenu';
import PolicyForm from './PolicyForm';
import type { PlatformSettings, PolicyInput } from '../../../../utils/api-types';
import { fetchPlatformParameters, updatePlatformPolicies } from '../../../../actions/Application';
import { useAppDispatch } from '../../../../utils/hooks';
import { useHelper } from '../../../../store';
import type { LoggedHelper } from '../../../../actions/helper';
import useDataLoader from '../../../../utils/hooks/useDataLoader';

const useStyles = makeStyles(() => ({
  container: {
    margin: 0,
    padding: '0 200px 50px 0',
  },
  paper: {
    height: '100%',
    minHeight: '100%',
    margin: '10px 0 0 0',
    padding: 20,
    borderRadius: 6,
  },
}));

const Policies: FunctionComponent = () => {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const { t } = useFormatter();
  const { settings }: { settings: PlatformSettings } = useHelper((helper: LoggedHelper) => ({
    settings: helper.getPlatformSettings(),
  }));
  useDataLoader(() => {
    dispatch(fetchPlatformParameters());
  });

  const initialValues = {
    platform_login_message: settings.platform_policies?.platform_login_message || '',
    platform_consent_message: settings.platform_policies?.platform_consent_message || '',
    platform_consent_confirm_text: settings.platform_policies?.platform_consent_confirm_text || '',
  };

  const onUpdate = (data: PolicyInput) => {
    dispatch(updatePlatformPolicies(data));
  };

  return (
    <div className={classes.container}>
      <Breadcrumbs variant="list" elements={[{ label: t('Settings') }, { label: t('Security') }, {
        label: t('Policies'),
        current: true,
      }]}
      />
      <SecurityMenu/>
      <Grid item={true} xs={6} style={{ marginTop: 30 }}>
        <Typography variant="h4" gutterBottom={true}>
          {t('Login messages')}
        </Typography>
        <Paper classes={{ root: classes.paper }} variant="outlined">
          <PolicyForm onSubmit={onUpdate} initialValues={initialValues}></PolicyForm>
        </Paper>
      </Grid>
    </div>
  );
};

export default Policies;
