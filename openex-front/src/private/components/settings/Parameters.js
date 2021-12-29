import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import * as R from 'ramda';
import { withStyles } from '@mui/styles';
import { connect } from 'react-redux';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import ParametersForm from './ParametersForm';
import inject18n from '../../../components/i18n';

const styles = () => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    position: 'relative',
    padding: 20,
    overflow: 'hidden',
    height: '100%',
  },
});

class Parameters extends Component {
  onUpdate(data) {
    return this.props.updateParameters(data);
  }

  render() {
    const { t, classes } = this.props;
    return (
      <div className={classes.root}>
        <Grid container={true} spacing={3}>
          <Grid item={true} xs={6}>
            <Typography variant="overline">{t('Parameters')}</Typography>
            <Paper variant="outlined" classes={{ root: classes.paper }}>
              <ParametersForm
                onSubmit={this.onUpdate.bind(this)}
                initialValues={{
                  platform_theme: 'dark',
                  platform_lang: 'auto',
                }}
              />
              <br />
              <Button
                variant="contained"
                color="primary"
                type="submit"
                form="parametersForm"
              >
                {t('Update')}
              </Button>
            </Paper>
          </Grid>
          <Grid item={true} xs={6}>
            <Typography variant="overline">
              {t('Components version')}
            </Typography>
            <Paper variant="outlined" classes={{ root: classes.paper }}>
              <List>
                <ListItem divider={true}>
                  <ListItemText primary={t('OpenEx platform')} />
                  <Chip label='3.0.0' color="primary" />
                </ListItem>
                <ListItem divider={true}>
                  <ListItemText primary={t('JAVA Virtual Machine')} />
                  <Chip label='17' color="primary" />
                </ListItem>
                <ListItem divider={true}>
                  <ListItemText primary={t('PostgreSQL')} />
                  <Chip label='10.19' color="primary" />
                </ListItem>
                <ListItem divider={true}>
                  <ListItemText primary={t('MinIO')} />
                  <Chip label='RELEASE-2021' color="primary" />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>
      </div>
    );
  }
}

Parameters.propTypes = {
  t: PropTypes.func,
  nsdt: PropTypes.func,
  updateParameters: PropTypes.func,
  userAdmin: PropTypes.bool,
};

const select = (state) => {
  const userId = R.path(['logged', 'user'], state.app);
  return {
    userAdmin: R.path([userId, 'user_admin'], state.referential.entities.users),
  };
};

export default R.compose(
  connect(select),
  inject18n,
  withStyles(styles),
)(Parameters);
