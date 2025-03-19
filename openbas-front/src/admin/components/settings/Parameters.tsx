import { Button, List, ListItem, ListItemText, Paper, Switch, TextField, Typography } from '@mui/material';
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
  const { t } = useFormatter();
  const { settings }: { settings: PlatformSettings } = useHelper((helper: LoggedHelper) => ({ settings: helper.getPlatformSettings() }));
  const isEnterpriseEdition = settings.platform_enterprise_edition === 'true';
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
    <div className={classes.container}>
      <div style={{ gridColumn: 'span 6' }}>
        <Breadcrumbs
          variant="object"
          elements={[{ label: t('Settings') }, {
            label: t('Parameters'),
            current: true,
          }]}
        />
      </div>
      <Typography style={{ gridColumn: 'span 3' }} variant="h4">{t('Configuration')}</Typography>
      <Typography variant="h4">{t('OpenBAS platform')}</Typography>
      <div style={{ gridColumn: 'span 2' }}>
        {!isEnterpriseEdition ? (
          <EnterpriseEditionButton inLine />
        ) : (
          <Button
            size="small"
            variant="outlined"
            color="primary"
            onClick={() => updateEnterpriseEdition({ platform_enterprise_edition: 'false' })}
            classes={{ root: classes.button }}
          >
            {t('Disable Enterprise Edition')}
          </Button>
        )}
      </div>
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
      <Paper
        variant="outlined"
        classes={{ root: classes.paper }}
        sx={{ gridColumn: 'span 3' }}
      >
        <List>
          <ListItem divider={true}>
            <ListItemText primary={t('Version')} />
            <ItemBoolean variant="large" status={null} neutralLabel={settings?.platform_version?.replace('-SNAPSHOT', '')} />
          </ListItem>
          <ListItem divider={true}>
            <ListItemText primary={t('Edition')} />
            <ItemBoolean
              variant="large"
              neutralLabel={
                isEnterpriseEdition
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
              disabled={settings.platform_enterprise_edition === 'false'}
              checked={settings.platform_whitemark === 'true'}
              onChange={(_event, checked) => updatePlatformWhitemark({ platform_whitemark: checked.toString() })}
            />
          </ListItem>
        </List>
      </Paper>

      <Typography style={{ gridColumn: 'span 2' }} className={classes.marginTop} variant="h4">{t('Dark theme')}</Typography>
      <Typography className={classes.marginTop} style={{ gridColumn: 'span 2' }} variant="h4">{t('Light theme')}</Typography>
      <Typography className={classes.marginTop} style={{ gridColumn: 'span 2' }} variant="h4">{t('Tools')}</Typography>
      <Paper variant="outlined" classes={{ root: classes.paper }} sx={{ gridColumn: 'span 2' }}>
        <ThemeForm
          onSubmit={onUpdateDarkParameters}
          initialValues={initialValuesDark}
        />
      </Paper>
      <Paper variant="outlined" classes={{ root: classes.paper }} sx={{ gridColumn: 'span 2' }}>
        <ThemeForm
          onSubmit={onUpdateLigthParameters}
          initialValues={initialValuesLight}
        />
      </Paper>
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
    </div>
  );
};

export default Parameters;
