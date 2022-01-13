import React from 'react';
import { makeStyles } from '@mui/styles';
import { useDispatch } from 'react-redux';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { useParams } from 'react-router-dom';
import { useFormatter } from '../../../../components/i18n';
import { useStore } from '../../../../store';
import useDataLoader from '../../../../utils/ServerSideEvent';
import { fetchComchecks } from '../../../../actions/Comcheck';

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
    marginTop: -20,
    paddingBottom: 50,
  },
  paper: {
    position: 'relative',
    padding: '20px 20px 0 20px',
    overflow: 'hidden',
    height: '100%',
  },
}));

const Controls = () => {
  // Standard hooks
  const classes = useStyles();
  const dispatch = useDispatch();
  const { t } = useFormatter();
  const { exerciseId } = useParams();
  const exercise = useStore((store) => store.getExercise(exerciseId));
  const { dryruns, comchecks } = exercise;
  useDataLoader(() => {
    dispatch(fetchComchecks(exerciseId));
  });
  return (
    <div className={classes.root}>
      <Grid container={true} spacing={3}>
        <Grid item={true} xs={6}>
          <Typography variant="overline">{t('Dryruns')}</Typography>
          <Paper variant="outlined" classes={{ root: classes.paper }}>
            test
          </Paper>
        </Grid>
        <Grid item={true} xs={6}>
          <Typography variant="overline">{t('Comchecks')}</Typography>
          <Paper variant="outlined" classes={{ root: classes.paper }}>
            test
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default Controls;
