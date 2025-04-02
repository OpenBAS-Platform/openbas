import { Alert, Button, Grid, List, ListItem, ListItemText, Paper, Switch, TextField, Typography } from '@mui/material';
import { makeStyles } from 'tss-react/mui';

import {
  fetchPlatformParameters,
  updatePlatformDarkParameters,
  updatePlatformEnterpriseEditionParameters,
  updatePlatformLightParameters,
  updatePlatformParameters,
  updatePlatformWhitemarkParameters,
} from '../../../actions/Application';
import { type LoggedHelper } from '../../../actions/helper';
import Breadcrumbs from '../../../components/Breadcrumbs';
import { useFormatter } from '../../../components/i18n';
import ItemBoolean from '../../../components/ItemBoolean';
import { useHelper } from '../../../store';
import { type PlatformSettings, type SettingsEnterpriseEditionUpdateInput, type SettingsPlatformWhitemarkUpdateInput, type SettingsUpdateInput, type ThemeInput } from '../../../utils/api-types';
import { useAppDispatch } from '../../../utils/hooks';
import useDataLoader from '../../../utils/hooks/useDataLoader';
import EnterpriseEditionButton from '../common/entreprise_edition/EnterpriseEditionButton';
import ParametersForm from './ParametersForm';
import ThemeForm from './ThemeForm';

const useStyles = makeStyles()(theme => ({
  container: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr',
    columnGap: theme.spacing(2),
  },
  paper: {
    padding: theme.spacing(2),
    borderRadius: 4,
  },
  button: { float: 'right' },
  marginTop: { marginTop: theme.spacing(2) },
}));

const Parameters = () => {
  const { classes } = useStyles();
  const dispatch = useAppDispatch();
  const { t, fldt } = useFormatter();
  const { settings }: { settings: PlatformSettings } = useHelper((helper: LoggedHelper) => ({ settings: helper.getPlatformSettings() }));
  const isEnterpriseEditionActivated = settings.platform_license.license_is_enterprise;
  const isEnterpriseEditionByConfig = settings.platform_license.license_is_by_configuration;
  const isEnterpriseEditionValid = settings.platform_license.license_is_validated;
  const isEnterpriseEdition = settings.platform_license?.license_is_validated === true;
  useDataLoader(() => {
    dispatch(fetchPlatformParameters());
  });

  const initialValuesDark = {
    accent_color: settings.platform_dark_theme?.accent_color ?? '',
    background_color: settings.platform_dark_theme?.background_color ?? '',
    logo_login_url: settings.platform_dark_theme?.logo_login_url ?? '',
    logo_url: settings.platform_dark_theme?.logo_url ?? '',
    logo_url_collapsed: settings.platform_dark_theme?.logo_url_collapsed ?? '',
    navigation_color: settings.platform_dark_theme?.navigation_color ?? '',
    paper_color: settings.platform_dark_theme?.paper_color ?? '',
    primary_color: settings.platform_dark_theme?.primary_color ?? '',
    secondary_color: settings.platform_dark_theme?.secondary_color ?? '',
  };

  const initialValuesLight = {
    accent_color: settings.platform_light_theme?.accent_color ?? '',
    background_color: settings.platform_light_theme?.background_color ?? '',
    logo_login_url: settings.platform_light_theme?.logo_login_url ?? '',
    logo_url: settings.platform_light_theme?.logo_url ?? '',
    logo_url_collapsed: settings.platform_light_theme?.logo_url_collapsed ?? '',
    navigation_color: settings.platform_light_theme?.navigation_color ?? '',
    paper_color: settings.platform_light_theme?.paper_color ?? '',
    primary_color: settings.platform_light_theme?.primary_color ?? '',
    secondary_color: settings.platform_light_theme?.secondary_color ?? '',
  };

  const onUpdate = (data: SettingsUpdateInput) => dispatch(updatePlatformParameters(data));
  const onUpdateLigthParameters = (data: ThemeInput) => dispatch(updatePlatformLightParameters(data));
  const onUpdateDarkParameters = (data: ThemeInput) => dispatch(updatePlatformDarkParameters(data));
  const updateEnterpriseEdition = (data: SettingsEnterpriseEditionUpdateInput) => dispatch(updatePlatformEnterpriseEditionParameters(data));
  const updatePlatformWhitemark = (data: SettingsPlatformWhitemarkUpdateInput) => dispatch(updatePlatformWhitemarkParameters(data));
  return (
    <div>
      <div style={{ gridColumn: 'span 6' }}>
        <Breadcrumbs
          variant="object"
          elements={[{ label: t('Settings') }, {
            label: t('Parameters'),
            current: true,
          }]}
        />
      </div>

      {isEnterpriseEditionActivated && (
        <Grid container={true} spacing={3} style={{ marginBottom: 23 }}>
          <Grid item xs={6}>
            <Typography variant="h4" gutterBottom={true} style={{ float: 'left' }}>
              {t('Enterprise Edition')}
            </Typography>
            {!isEnterpriseEditionByConfig && (
              <div style={{
                float: 'right',
                marginTop: 4,
                position: 'relative',
              }}
              >

              </div>
            )}
            <div className="clearfix" />
            <Paper classes={{ root: classes.paper }} variant="outlined" className="paper-for-grid" style={{ marginTop: 6 }}>
              <List style={{ marginTop: -20 }}>
                <ListItem divider={true}>
                  <ListItemText primary={t('Organization')} />
                  <ItemBoolean
                    variant="large"
                    neutralLabel={settings.platform_license.license_customer}
                    status={null}
                  />
                </ListItem>
                <ListItem divider={true}>
                  <ListItemText primary={t('Creator')} />
                  <ItemBoolean
                    variant="large"
                    neutralLabel={settings.platform_license.license_creator}
                    status={null}
                  />
                </ListItem>
                <ListItem divider={true}>
                  <ListItemText primary={t('Scope')} />
                  <ItemBoolean
                    variant="large"
                    neutralLabel={settings.platform_license.license_is_global ? t('Global') : t('Current instance')}
                    status={null}
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="h4" gutterBottom={true} style={{ float: 'left' }}>
              {t('License')}
            </Typography>
            {!isEnterpriseEditionByConfig && (
              <div style={{
                float: 'right',
                marginTop: 2,
                position: 'relative',
              }}
              >
                {!isEnterpriseEdition ? (
                  <EnterpriseEditionButton inLine={true} />
                ) : (
                  <Button
                    size="small"
                    variant="outlined"
                    color="primary"
                    onClick={() => updateEnterpriseEdition({ platform_enterprise_license: '' })}
                    classes={{ root: classes.button }}
                  >
                    {t('Disable Enterprise Edition')}
                  </Button>
                )}
              </div>
            )}
            <div className="clearfix" />
            <Paper classes={{ root: classes.paper }} variant="outlined" className="paper-for-grid" style={{ marginTop: 6 }}>
              <List style={{ marginTop: -20 }}>
                {!settings.platform_license.license_is_expired && settings.platform_license.license_is_prevention && (
                  <ListItem divider={false}>
                    <Alert severity="warning" variant="outlined" style={{ width: '100%' }}>
                      {t('Your Enterprise Edition license will expire in less than 3 months.')}
                    </Alert>
                  </ListItem>
                )}
                {!settings.platform_license.license_is_validated && settings.platform_license.license_is_valid_cert && (
                  <ListItem divider={false}>
                    <Alert severity="error" variant="outlined" style={{ width: '100%' }}>
                      {t('Your Enterprise Edition license is expired. Please contact your Filigran representative.')}
                    </Alert>
                  </ListItem>
                )}
                <ListItem divider={true}>
                  <ListItemText primary={t('Start date')} />
                  <ItemBoolean
                    variant="xlarge"
                    label={fldt(settings.platform_license.license_start_date)}
                    status={!settings.platform_license.license_is_expired}
                  />
                </ListItem>
                <ListItem divider={true}>
                  <ListItemText primary={t('Expiration date')} />
                  <ItemBoolean
                    variant="xlarge"
                    label={fldt(settings.platform_license.license_expiration_date)}
                    status={!settings.platform_license.license_is_expired}
                  />
                </ListItem>
                <ListItem divider={!settings.platform_license.license_is_prevention}>
                  <ListItemText primary={t('License type')} />
                  <ItemBoolean
                    variant="large"
                    neutralLabel={settings.platform_license.license_type}
                    status={null}
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>
      )}

      <Grid container={true} spacing={3} style={{ marginBottom: 23 }}>
        <Grid item xs={6}>
          <Typography variant="h4" gutterBottom={true}>{t('Configuration')}</Typography>
          <Paper variant="outlined" classes={{ root: classes.paper }} sx={{ gridColumn: 'span 3' }}>
            <ParametersForm
              onSubmit={onUpdate}
              initialValues={{
                platform_name: settings?.platform_name,
                platform_theme: settings?.platform_theme,
                platform_lang: settings?.platform_lang,
              }}
            />
          </Paper>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="h4" gutterBottom={true}>{t('OpenBAS platform')}</Typography>
          <Paper
            variant="outlined"
            classes={{ root: classes.paper }}
            sx={{ gridColumn: 'span 3' }}
          >
            <List>
              {!isEnterpriseEditionActivated && (
                <ListItem divider={true}>
                  <ListItemText primary="" />
                  <div style={{ float: 'right' }}>
                    <EnterpriseEditionButton inLine={true} />
                  </div>
                </ListItem>
              )}
              <ListItem divider={true}>
                <ListItemText primary={t('Version')} />
                <ItemBoolean variant="large" status={null} neutralLabel={settings?.platform_version?.replace('-SNAPSHOT', '')} />
              </ListItem>
              <ListItem divider={true}>
                <ListItemText primary={t('Edition')} />
                <ItemBoolean
                  variant="large"
                  neutralLabel={
                    isEnterpriseEditionValid
                      ? t('Enterprise')
                      : t('Community')
                  }
                  status={null}
                />
              </ListItem>
              <ListItem divider={true}>
                <ListItemText
                  primary={t('AI Powered')}
                />
                <ItemBoolean
                  variant="large"
                  label={
                    // eslint-disable-next-line no-nested-ternary
                    !settings.platform_ai_enabled ? t('Disabled') : settings.platform_ai_has_token
                      ? settings.platform_ai_type
                      : `${settings.platform_ai_type} - ${t('Missing token')}`
                  }
                  status={(settings.platform_ai_enabled) && (settings.platform_ai_has_token)}
                  tooltip={settings.platform_ai_has_token ? `${settings.platform_ai_type} - ${settings.platform_ai_model}` : t('The token is missing in your platform configuration, please ask your Filigran representative to provide you with it or with on-premise deployment instructions. Your can open a support ticket to do so.')}
                />
              </ListItem>
              <ListItem divider={true}>
                <TextField fullWidth={true} label={t('Filigran support key')} variant="standard" disabled={true} />
              </ListItem>
              <ListItem divider={true}>
                <ListItemText primary={t('Remove Filigran logos')} />
                <Switch
                  disabled={settings.platform_license?.license_is_validated === false}
                  checked={settings.platform_whitemark === 'true'}
                  onChange={(_event, checked) => updatePlatformWhitemark({ platform_whitemark: checked.toString() })}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>

      <Grid container={true} spacing={3} style={{ marginBottom: 23 }}>
        <Grid item xs={4}>
          <Typography style={{ gridColumn: 'span 2' }} className={classes.marginTop} variant="h4">{t('Dark theme')}</Typography>
          <Paper variant="outlined" classes={{ root: classes.paper }} sx={{ gridColumn: 'span 2' }}>
            <ThemeForm onSubmit={onUpdateDarkParameters} initialValues={initialValuesDark} />
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Typography className={classes.marginTop} style={{ gridColumn: 'span 2' }} variant="h4">{t('Light theme')}</Typography>
          <Paper variant="outlined" classes={{ root: classes.paper }} sx={{ gridColumn: 'span 2' }}>
            <ThemeForm onSubmit={onUpdateLigthParameters} initialValues={initialValuesLight} />
          </Paper>
        </Grid>
        <Grid item xs={4}>
          <Typography className={classes.marginTop} style={{ gridColumn: 'span 2' }} variant="h4">{t('Tools')}</Typography>
          <Paper variant="outlined" classes={{ root: classes.paper }} sx={{ gridColumn: 'span 2' }}>
            <List style={{ paddingTop: 0 }}>
              <ListItem divider={true}>
                <ListItemText primary={t('JAVA Virtual Machine')} />
                <ItemBoolean status={null} variant="large" neutralLabel={settings?.java_version} />
              </ListItem>
              <ListItem divider={true}>
                <ListItemText primary={t('PostgreSQL')} />
                <ItemBoolean status={null} variant="large" neutralLabel={settings?.postgre_version} />
              </ListItem>
              <ListItem divider={true}>
                <ListItemText primary={t('RabbitMQ')} />
                <ItemBoolean status={null} variant="large" neutralLabel={settings?.rabbitmq_version} />
              </ListItem>
              <ListItem divider={true}>
                <ListItemText primary={t('Telemetry manager')} />
                <ItemBoolean status={settings?.telemetry_manager_enable} variant="large" label={settings?.telemetry_manager_enable ? t('Enable') : t('Disabled')} />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default Parameters;
