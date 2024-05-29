import React, { FunctionComponent } from 'react';
import { Grid, Paper, TextField, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Field } from 'react-final-form';
import { useFormatter } from '../../../../components/i18n';
import MarkDownField from '../../../../components/fields/MarkDownField';
import Breadcrumbs from '../../../../components/Breadcrumbs';
import SecurityMenu from '../SecurityMenu';

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
  const { t } = useFormatter();

  return (
    <div className={classes.container}>
      <Breadcrumbs variant="list" elements={[{ label: t('Settings') }, { label: t('Security') }, { label: t('Policies'), current: true }]} />
      <SecurityMenu />
      <Grid item={true} xs={6} style={{ marginTop: 30 }}>
        <Typography variant="h4" gutterBottom={true}>
          {t('Login messages')}
        </Typography>
        <Paper classes={{ root: classes.paper }} variant="outlined">

        </Paper>
      </Grid>
    </div>
  );
};

export default Policies;
