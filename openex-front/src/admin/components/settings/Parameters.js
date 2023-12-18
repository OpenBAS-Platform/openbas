import React from 'react';
import * as PropTypes from 'prop-types';
import * as R from 'ramda';
import { withStyles } from '@mui/styles';
import { connect, useDispatch } from 'react-redux';
import { Typography, Grid, Paper, List, ListItem, ListItemText, Chip } from '@mui/material';
import ParametersForm from './ParametersForm';
import inject18n from '../../../components/i18n';
import { storeHelper } from '../../../actions/Schema';
import { updateParameters, fetchParameters } from '../../../actions/Application';
import useDataLoader from '../../../utils/ServerSideEvent';

const styles = () => ({
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
});

const Parameters = (props) => {
  const {
    updateParameters: connectedUpdateParameters,
    t,
    classes,
    settings,
  } = props;
  const dispatch = useDispatch();
  useDataLoader(() => {
    dispatch(fetchParameters());
  });
  const onUpdate = (data) => connectedUpdateParameters(data);
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
          <Typography variant="h4">{t('Components version')}</Typography>
          <Paper variant="outlined" classes={{ root: classes.paper }}>
            <List style={{ paddingTop: 0 }}>
              <ListItem divider={true}>
                <ListItemText primary={t('OpenEx platform')} />
                <Chip label={settings?.platform_version} color="primary" />
              </ListItem>
              <ListItem divider={true}>
                <ListItemText primary={t('JAVA Virtual Machine')} />
                <Chip label={settings?.java_version} color="primary" />
              </ListItem>
              <ListItem divider={true}>
                <ListItemText primary={t('PostgreSQL')} />
                <Chip label={settings?.postgre_version} color="primary" />
              </ListItem>
              <ListItem divider={true}>
                <ListItemText primary={t('Minio (S3)')} />
                <Chip label={t('Latest stable build')} color="primary" />
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

Parameters.propTypes = {
  t: PropTypes.func,
  nsdt: PropTypes.func,
  updateParameters: PropTypes.func,
  userAdmin: PropTypes.bool,
};

const select = (state) => {
  const helper = storeHelper(state);
  return {
    userAdmin: helper.getMe()?.user_admin,
    settings: helper.getSettings(),
  };
};

export default R.compose(
  connect(select, { updateParameters }),
  inject18n,
  withStyles(styles),
)(Parameters);
