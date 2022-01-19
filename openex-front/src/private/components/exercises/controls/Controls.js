import React, { useState } from 'react';
import { makeStyles } from '@mui/styles';
import { useDispatch } from 'react-redux';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { Link, useParams } from 'react-router-dom';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import {
  VideoSettingsOutlined,
  DeleteOutlined,
  MarkEmailReadOutlined,
} from '@mui/icons-material';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { useFormatter } from '../../../../components/i18n';
import useDataLoader from '../../../../utils/ServerSideEvent';
import { fetchAudiences } from '../../../../actions/Audience';
import { fetchComchecks, deleteComcheck } from '../../../../actions/Comcheck';
import CreateControl from './CreateControl';
import { useStore } from '../../../../store';
import Empty from '../../../../components/Empty';
import ComcheckState from './ComcheckState';
import { Transition } from '../../../../utils/Environment';
import DryrunStatus from './DryrunStatus';
import { deleteDryrun, fetchDryruns } from '../../../../actions/Dryrun';

const useStyles = makeStyles(() => ({
  root: {
    marginTop: -20,
    flexGrow: 1,
    paddingBottom: 50,
  },
  paper: {
    position: 'relative',
    padding: 0,
    overflow: 'hidden',
    height: '100%',
  },
  item: {
    height: 50,
    minHeight: 50,
    maxHeight: 50,
    paddingRight: 0,
  },
  bodyItem: {
    height: '100%',
    fontSize: 14,
    float: 'left',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
}));

const Controls = () => {
  // Standard hooks
  const classes = useStyles();
  const dispatch = useDispatch();
  const { t, nsd } = useFormatter();
  const { exerciseId } = useParams();
  const [openComcheckDelete, setOpenComcheckDelete] = useState(null);
  const [openDryrunDelete, setOpenDryrunDelete] = useState(null);
  const exercise = useStore((store) => store.getExercise(exerciseId));
  const { dryruns, comchecks } = exercise;
  useDataLoader(() => {
    dispatch(fetchAudiences(exerciseId));
    dispatch(fetchComchecks(exerciseId));
    dispatch(fetchDryruns(exerciseId));
  });
  const submitComcheckDelete = () => {
    dispatch(deleteComcheck(exerciseId, openComcheckDelete));
    setOpenComcheckDelete(null);
  };
  const submitDryrunDelete = () => {
    dispatch(deleteDryrun(exerciseId, openDryrunDelete));
    setOpenDryrunDelete(null);
  };
  return (
    <div className={classes.root}>
      <Grid container={true} spacing={3}>
        <Grid item={true} xs={6} style={{ marginTop: -10 }}>
          <Typography variant="overline">{t('Dryruns')}</Typography>
          <Paper variant="outlined" classes={{ root: classes.paper }}>
            {dryruns.length > 0 ? (
              <List style={{ paddingTop: 0 }}>
                {dryruns.map((dryrun) => (
                  <ListItem
                    key={dryrun.dryrun_id}
                    dense={true}
                    button={true}
                    classes={{ root: classes.item }}
                    divider={true}
                    component={Link}
                    to={`/exercises/${exercise.exercise_id}/controls/dryruns/${dryrun.dryrun_id}`}
                  >
                    <ListItemIcon>
                      <VideoSettingsOutlined />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <div>
                          <div
                            className={classes.bodyItem}
                            style={{ width: '30%' }}
                          >
                            {nsd(dryrun.dryrun_date)}
                            <span style={{ fontSize: 20 }}>&nbsp;</span>
                          </div>
                          <div
                            className={classes.bodyItem}
                            style={{ width: '15%' }}
                          >
                            <span style={{ fontSize: 20 }}>&nbsp;</span>
                            <code>{dryrun.dryrun_speed}x</code>
                          </div>
                          <div
                            className={classes.bodyItem}
                            style={{ width: '20%' }}
                          >
                            <span style={{ fontWeight: 600 }}>
                              {dryrun.dryrun_injects_number}
                            </span>
                            <span style={{ fontSize: 20 }}>&nbsp;</span>
                            {t('injects')}
                          </div>
                          <div className={classes.bodyItem}>
                            <DryrunStatus
                              finished={dryrun.dryrun_finished}
                              variant="list"
                            />
                          </div>
                        </div>
                      }
                    />
                    <ListItemSecondaryAction style={{ paddingTop: 4 }}>
                      <IconButton
                        onClick={() => setOpenDryrunDelete(dryrun.dryrun_id)}
                        aria-haspopup="true"
                        size="large"
                      >
                        <DeleteOutlined />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Empty message={t('No dryrun in this exercise.')} />
            )}
          </Paper>
        </Grid>
        <Grid item={true} xs={6} style={{ marginTop: -10 }}>
          <Typography variant="overline">{t('Comchecks')}</Typography>
          <Paper variant="outlined" classes={{ root: classes.paper }}>
            {comchecks.length > 0 ? (
              <List style={{ paddingTop: 0 }}>
                {comchecks.map((comcheck) => (
                  <ListItem
                    key={comcheck.comcheck_id}
                    dense={true}
                    button={true}
                    classes={{ root: classes.item }}
                    divider={true}
                    component={Link}
                    to={`/exercises/${exercise.exercise_id}/controls/comchecks/${comcheck.comcheck_id}`}
                  >
                    <ListItemIcon>
                      <MarkEmailReadOutlined />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <div>
                          <div
                            className={classes.bodyItem}
                            style={{ width: '50%' }}
                          >
                            {nsd(comcheck.comcheck_start_date)}
                            <span style={{ fontSize: 20 }}>
                              &nbsp;&nbsp;&#8594;&nbsp;&nbsp;
                            </span>
                            {nsd(comcheck.comcheck_end_date)}
                          </div>
                          <div
                            className={classes.bodyItem}
                            style={{ width: '20%' }}
                          >
                            <span style={{ fontWeight: 600 }}>
                              {comcheck.comcheck_users_number}
                            </span>
                            <span style={{ fontSize: 20 }}>&nbsp;</span>
                            {t('players')}
                          </div>
                          <div className={classes.bodyItem}>
                            <ComcheckState
                              state={comcheck.comcheck_state}
                              variant="list"
                            />
                          </div>
                        </div>
                      }
                    />
                    <ListItemSecondaryAction style={{ paddingTop: 4 }}>
                      <IconButton
                        onClick={() => setOpenComcheckDelete(comcheck.comcheck_id)
                        }
                        aria-haspopup="true"
                        size="large"
                      >
                        <DeleteOutlined />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Empty message={t('No comcheck in this exercise.')} />
            )}
          </Paper>
        </Grid>
      </Grid>
      <CreateControl exerciseId={exerciseId} />
      <Dialog
        open={Boolean(openComcheckDelete)}
        TransitionComponent={Transition}
        onClose={() => setOpenComcheckDelete(null)}
      >
        <DialogContent>
          <DialogContentText>
            {t('Do you want to delete this comcheck?')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => setOpenComcheckDelete(null)}
          >
            {t('Cancel')}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={submitComcheckDelete}
          >
            {t('Delete')}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={Boolean(openDryrunDelete)}
        TransitionComponent={Transition}
        onClose={() => setOpenDryrunDelete(null)}
      >
        <DialogContent>
          <DialogContentText>
            {t('Do you want to delete this dryrun?')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="secondary"
            onClick={() => setOpenDryrunDelete(null)}
          >
            {t('Cancel')}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={submitDryrunDelete}
          >
            {t('Delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Controls;
