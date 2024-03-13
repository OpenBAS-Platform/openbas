import React from 'react';
import { makeStyles } from '@mui/styles';
import { Typography, Grid, Paper, List, ListItem, ListItemText, Switch, TextField } from '@mui/material';
import ParametersForm from './ParametersForm';
import { useFormatter } from '../../../components/i18n';
import { updateParameters, fetchParameters } from '../../../actions/Application';
import useDataLoader from '../../../utils/ServerSideEvent';
import ItemBoolean from '../../../components/ItemBoolean';
import ThemeForm from './ThemeForm';
import { useAppDispatch } from '../../../utils/hooks';
import { useHelper } from '../../../store';
import type { LoggedHelper } from '../../../actions/helper';
import type { SettingsUpdateInput } from '../../../utils/api-types';

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
    paddingBottom: 50,
  },
  paper: {
    position: 'relative',
    padding: 20,
    overflow: 'hidden',
    height: '100%',
  },
}));

const Parameters = () => {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const { t } = useFormatter();

  const { settings } = useHelper((helper: LoggedHelper) => ({
    settings: helper.getSettings(),
  }));
  useDataLoader(() => {
    dispatch(fetchParameters());
  });

  const onUpdate = (data: SettingsUpdateInput) => dispatch(updateParameters(data));
  return (
    <div className={classes.root}>
      <Grid container={true} spacing={3}>
        <Grid item={true} xs={6}>
          <Typography variant="h4">{t('Parameters')}</Typography>
          <Paper variant="outlined" classes={{ root: classes.paper }}>
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
        <Grid item={true} xs={6}>
          <Typography variant="h4">{t('OpenBAS platform')}</Typography>
          <Paper variant="outlined" classes={{ root: classes.paper }}>
            <List style={{ paddingTop: 0 }}>
              <ListItem divider={true}>
                <ListItemText primary={t('Version')} />
                <ItemBoolean variant="inList" status={null} neutralLabel={settings?.platform_version?.replace('-SNAPSHOT', '')} />
              </ListItem>
              <ListItem divider={true}>
                <ListItemText primary={t('Edition')} />
                <ItemBoolean variant="inList" status={null} neutralLabel='Community' />
              </ListItem>
              <ListItem divider={true}>
                <TextField fullWidth={true} label={t('Filigran support key')} variant="standard" disabled={true} />
              </ListItem>
              <ListItem divider={true}>
                <ListItemText primary={t('Remove Filigran logos')} />
                <Switch disabled={true} />
              </ListItem>
            </List>
          </Paper>
        </Grid>
        <Grid item={true} xs={4} style={{ marginTop: 30 }}>
          <Typography variant="h4">{t('Dark theme')}</Typography>
          <Paper variant="outlined" classes={{ root: classes.paper }}>
            <ThemeForm />
          </Paper>
        </Grid>
        <Grid item={true} xs={4} style={{ marginTop: 30 }}>
          <Typography variant="h4">{t('Light theme')}</Typography>
          <Paper variant="outlined" classes={{ root: classes.paper }}>
            <ThemeForm />
          </Paper>
        </Grid>
        <Grid item={true} xs={4} style={{ marginTop: 30 }}>
          <Typography variant="h4">{t('Tools')}</Typography>
          <Paper variant="outlined" classes={{ root: classes.paper }}>
            <List style={{ paddingTop: 0 }}>
              <ListItem divider={true}>
                <ListItemText primary={t('JAVA Virtual Machine')} />
                <ItemBoolean status={null} neutralLabel={settings?.java_version} />
              </ListItem>
              <ListItem divider={true}>
                <ListItemText primary={t('PostgreSQL')} />
                <ItemBoolean status={null} neutralLabel={settings?.postgre_version} />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default Parameters;
