import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type React from 'react';
import { useState } from 'react';
import { makeStyles } from 'tss-react/mui';

import { fetchPlatformParameters, updatePlatformEnterpriseEditionParameters } from '../../../../actions/Application';
import { type LoggedHelper } from '../../../../actions/helper';
import Breadcrumbs from '../../../../components/Breadcrumbs';
import { useFormatter } from '../../../../components/i18n';
import ItemBoolean from '../../../../components/ItemBoolean';
import { useHelper } from '../../../../store';
import {
  type PlatformSettings,
  type SettingsEnterpriseEditionUpdateInput,
} from '../../../../utils/api-types';
import { useAppDispatch } from '../../../../utils/hooks';
import useDataLoader from '../../../../utils/hooks/useDataLoader';
import EnterpriseEditionButton from '../../common/entreprise_edition/EnterpriseEditionButton';
import XtmHubSettings from './xtm_hub/XtmHubSettings';

const useStyles = makeStyles()(theme => ({
  container: {
    margin: 0,
    padding: '0 0 50px 0',
  },
  paper: {
    padding: '10px 20px 0 20px',
    borderRadius: 4,
  },
  enterpriseEditionButton: { marginTop: theme.spacing(-2.1) },
  button: { marginBottom: theme.spacing(1) },
  marginBottom: { marginBottom: theme.spacing(3) },
}));

const Experience: React.FC = () => {
  const { classes } = useStyles();

  const theme = useTheme();

  const { t, fldt } = useFormatter();
  const dispatch = useAppDispatch();
  const [openEEChanges, setOpenEEChanges] = useState(false);
  const { settings }: { settings: PlatformSettings } = useHelper((helper: LoggedHelper) => ({ settings: helper.getPlatformSettings() }));
  const isEnterpriseEditionActivated = settings.platform_license?.license_is_enterprise;
  const isEnterpriseEditionByConfig = settings.platform_license?.license_is_by_configuration;
  const isEnterpriseEdition = settings.platform_license?.license_is_validated === true;
  const updateEnterpriseEdition = (data: SettingsEnterpriseEditionUpdateInput) => dispatch(updatePlatformEnterpriseEditionParameters(data));

  useDataLoader(() => {
    dispatch(fetchPlatformParameters());
  });

  return (
    <div className={classes.container}>
      <Breadcrumbs
        style={{
          gridColumn: 'span 12',
          marginBottom: theme.spacing(4),
        }}
        variant="list"
        elements={[{ label: t('Settings') }, {
          label: t('Filigran Experience'),
          current: true,
        }]}
      />

      <Grid container spacing={3}>
        {isEnterpriseEditionActivated && (
          <Grid container flexDirection="column" gap="0" size={6}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
            }}
            >
              <Typography variant="h4" gutterBottom={true} style={{ float: 'left' }}>
                {t('Enterprise Edition')}
              </Typography>
              {!isEnterpriseEditionByConfig && !isEnterpriseEdition && (
                <EnterpriseEditionButton
                  style={{
                    marginLeft: 'auto',
                    gridColumn: 'span 2',
                  }}
                  classes={{ root: classes.button }}
                />
              )}
              {!isEnterpriseEditionByConfig && isEnterpriseEdition && (
                <>
                  <div className={classes.enterpriseEditionButton}>
                    <Button
                      size="small"
                      variant="outlined"
                      color="primary"
                      onClick={() => setOpenEEChanges(true)}
                    >
                      {t('Disable Enterprise Edition')}
                    </Button>
                  </div>
                  <Dialog
                    slotProps={{ paper: { elevation: 1 } }}
                    open={openEEChanges}
                    keepMounted
                    onClose={() => setOpenEEChanges(false)}
                  >
                    <DialogTitle>{t('Disable Enterprise Edition')}</DialogTitle>
                    <DialogContent>
                      <DialogContentText>
                        <Alert
                          severity="warning"
                          variant="outlined"
                          color="error"
                        >
                          {t('You are about to disable the "Enterprise Edition" mode. Please note that this action will disable access to certain advanced features.')}
                          <br />
                          <br />
                          <strong>{t('However, your existing data will remain intact and will not be lost.')}</strong>
                        </Alert>
                      </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                      <Button
                        onClick={() => {
                          setOpenEEChanges(false);
                        }}
                      >
                        {t('Cancel')}
                      </Button>
                      <Button
                        color="secondary"
                        onClick={() => {
                          setOpenEEChanges(false);
                          updateEnterpriseEdition({ platform_enterprise_license: '' });
                        }}
                      >
                        {t('Validate')}
                      </Button>
                    </DialogActions>
                  </Dialog>
                </>
              )}
            </div>

            <Paper
              classes={{ root: classes.paper }}
              style={{ flexGrow: 1 }}
              variant="outlined"
            >
              <List style={{ padding: 0 }}>
                <ListItem divider={true}>
                  <ListItemText primary={t('Organization')} />
                  <ItemBoolean
                    variant="xlarge"
                    neutralLabel={settings.platform_license?.license_customer}
                    status={null}
                  />
                </ListItem>
                <ListItem divider={true}>
                  <ListItemText primary={t('Creator')} />
                  <ItemBoolean
                    variant="xlarge"
                    neutralLabel={settings.platform_license?.license_creator}
                    status={null}
                  />
                </ListItem>
                <ListItem divider={true}>
                  <ListItemText primary={t('Scope')} />
                  <ItemBoolean
                    variant="xlarge"
                    neutralLabel={settings.platform_license?.license_is_global ? t('Global') : t('Current instance')}
                    status={null}
                  />
                </ListItem>
                {!settings.platform_license?.license_is_expired && settings.platform_license?.license_is_prevention && (
                  <ListItem divider={false}>
                    <Alert severity="warning" variant="outlined" style={{ width: '100%' }}>
                      {t('Your Enterprise Edition license will expire in less than 3 months.')}
                    </Alert>
                  </ListItem>
                )}
                {!settings.platform_license?.license_is_validated && settings.platform_license?.license_is_valid_cert && (
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
                    label={fldt(settings.platform_license?.license_start_date)}
                    status={!settings.platform_license?.license_is_expired}
                  />
                </ListItem>
                <ListItem divider={true}>
                  <ListItemText primary={t('Expiration date')} />
                  <ItemBoolean
                    variant="xlarge"
                    label={fldt(settings.platform_license?.license_expiration_date)}
                    status={!settings.platform_license?.license_is_expired}
                  />
                </ListItem>
                <ListItem divider={!settings.platform_license?.license_is_prevention}>
                  <ListItemText primary={t('License type')} />
                  <ItemBoolean
                    variant="xlarge"
                    neutralLabel={settings.platform_license?.license_type}
                    status={null}
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        )}

        {!isEnterpriseEditionActivated && (
          <Grid container flexDirection="column" gap="0" size={6}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
            }}
            >
              <Typography
                variant="h4"
                gutterBottom
              >
                {t('Enterprise Edition')}
              </Typography>
              {!isEnterpriseEditionActivated && (
                <div className={classes.enterpriseEditionButton}>
                  <EnterpriseEditionButton
                    style={{
                      marginLeft: 'auto',
                      gridColumn: 'span 2',
                    }}
                    classes={{ root: classes.button }}
                  />
                </div>
              )}
            </div>

            <Paper
              classes={{ root: classes.paper }}
              sx={{ flexGrow: 1 }}
              className="paper-for-grid"
              variant="outlined"
            >
              <Typography variant="h6">
                {t('Enable powerful features with OpenAEV Enterprise Edition')}
              </Typography>
              <p>{t('OpenAEV Enterprise Edition (EE) provides highly demanding organizations with a version that includes additional and powerful features, which require specific investments in research and development.')}</p>
              <List sx={{
                listStyleType: 'disc',
                marginLeft: 4,
              }}
              >
                <li>{t('Agentic AI capabilities')}</li>
                <li>{t('Playbooks and automation')}</li>
                <li>{t('Full text indexing')}</li>
                <li>{t('And many more features...')}</li>
              </List>
            </Paper>
          </Grid>
        )}

        <Grid container flexDirection="column" gap="0" size={6}>
          <XtmHubSettings />
        </Grid>
      </Grid>
    </div>
  );
};

export default Experience;
