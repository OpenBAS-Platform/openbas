import React, { useRef, useState, useEffect } from 'react';
import { makeStyles, useTheme } from '@mui/styles';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import {
  SportsScoreOutlined,
  SpeakerNotesOutlined,
  BallotOutlined,
  ContactMailOutlined,
  FlagOutlined,
  RateReviewOutlined,
  ExpandMoreOutlined,
  EditOutlined,
} from '@mui/icons-material';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import LinearProgress from '@mui/material/LinearProgress';
import * as R from 'ramda';
import IconButton from '@mui/material/IconButton';
import CreateObjective from './CreateObjective';
import { useFormatter } from '../../../../components/i18n';
import { useStore } from '../../../../store';
import useDataLoader from '../../../../utils/ServerSideEvent';
import { fetchObjectives } from '../../../../actions/Objective';
import Empty from '../../../../components/Empty';
import ObjectivePopover from './ObjectivePopover';
import { addLog, fetchLogs } from '../../../../actions/Log';
import LogPopover from './LogPopover';
import { resolveUserName } from '../../../../utils/String';
import ItemTags from '../../../../components/ItemTags';
import LogForm from './LogForm';

const useStyles = makeStyles(() => ({
  root: {
    flexGrow: 1,
  },
  metric: {
    position: 'relative',
    padding: 20,
    height: 100,
    overflow: 'hidden',
  },
  title: {
    fontSize: 16,
  },
  number: {
    fontSize: 30,
    fontWeight: 800,
    float: 'left',
  },
  icon: {
    position: 'absolute',
    top: 25,
    right: 15,
  },
  paper: {
    position: 'relative',
    padding: 0,
    overflow: 'hidden',
    height: '100%',
  },
  card: {
    width: '100%',
    height: '100%',
    marginBottom: 30,
    borderRadius: 6,
    padding: 0,
    position: 'relative',
  },
  heading: {
    display: 'flex',
  },
}));

const Lessons = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const theme = useTheme();
  const { t, nsdt } = useFormatter();
  const [open, setOpen] = useState(false);
  const bottomRef = useRef(null);
  // Fetching data
  const { exerciseId } = useParams();
  const exercise = useStore((store) => store.getExercise(exerciseId));
  const { objectives, logs } = exercise;
  useDataLoader(() => {
    dispatch(fetchObjectives(exerciseId));
    dispatch(fetchLogs(exerciseId));
  });
  const scrollToBottom = () => {
    setTimeout(() => {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }, 400);
  };
  const handleToggleWrite = () => setOpen(!open);
  useEffect(() => {
    if (open) {
      scrollToBottom();
    }
  }, [open]);
  // eslint-disable-next-line max-len
  const submitCreateLog = (data, action) => {
    const inputValues = R.pipe(
      R.assoc('log_tags', R.pluck('id', data.log_tags)),
    )(data);
    // eslint-disable-next-line max-len
    return dispatch(addLog(exerciseId, inputValues)).then((result) => {
      if (result.result) {
        action.reset();
        action.resetFieldState('log_title');
        action.resetFieldState('log_content');
        return handleToggleWrite();
      }
      return result;
    });
  };
  return (
    <div className={classes.root}>
      <Grid container={true} spacing={3} style={{ marginTop: -14 }}>
        <Grid item={true} xs={3} style={{ marginTop: -14 }}>
          <Paper variant="outlined" classes={{ root: classes.metric }}>
            <div className={classes.icon}>
              <SportsScoreOutlined color="primary" sx={{ fontSize: 50 }} />
            </div>
            <div className={classes.title}>{t('Overall objectives score')}</div>
            <div className={classes.number}>80%</div>
          </Paper>
        </Grid>
        <Grid item={true} xs={3} style={{ marginTop: -14 }}>
          <Paper variant="outlined" classes={{ root: classes.metric }}>
            <div className={classes.icon}>
              <SpeakerNotesOutlined color="primary" sx={{ fontSize: 50 }} />
            </div>
            <div className={classes.title}>{t('Exercise logs')}</div>
            <div className={classes.number}>0</div>
          </Paper>
        </Grid>
        <Grid item={true} xs={3} style={{ marginTop: -14 }}>
          <Paper variant="outlined" classes={{ root: classes.metric }}>
            <div className={classes.icon}>
              <BallotOutlined color="primary" sx={{ fontSize: 50 }} />
            </div>
            <div className={classes.title}>{t('Poll replies')}</div>
            <div className={classes.number}>0</div>
          </Paper>
        </Grid>
        <Grid item={true} xs={3} style={{ marginTop: -14 }}>
          <Paper variant="outlined" classes={{ root: classes.metric }}>
            <div className={classes.icon}>
              <ContactMailOutlined color="primary" sx={{ fontSize: 50 }} />
            </div>
            <div className={classes.title}>{t('Messages')}</div>
            <div className={classes.number}>-</div>
          </Paper>
        </Grid>
      </Grid>
      <br />
      <Grid container={true} spacing={3}>
        <Grid item={true} xs={6}>
          <Typography variant="overline" style={{ float: 'left' }}>
            {t('Objectives')}
          </Typography>
          <CreateObjective exerciseId={exerciseId} />
          <div className="clearfix" />
          <Paper variant="outlined" classes={{ root: classes.paper }}>
            {objectives.length > 0 ? (
              <List style={{ padding: 0 }}>
                {objectives.map((objective) => (
                  <ListItem divider={true} key={objective.objective_id}>
                    <ListItemIcon>
                      <FlagOutlined />
                    </ListItemIcon>
                    <ListItemText
                      primary={objective.objective_title}
                      secondary={objective.objective_description}
                    />
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        width: 200,
                        marginRight: 1,
                      }}
                    >
                      <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress variant="determinate" value={50} />
                      </Box>
                      <Box sx={{ minWidth: 35 }}>
                        <Typography variant="body2" color="text.secondary">
                          50%
                        </Typography>
                      </Box>
                    </Box>
                    <ListItemSecondaryAction>
                      <ObjectivePopover
                        exerciseId={exerciseId}
                        objective={objective}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Empty message={t('No objectives in this exercise.')} />
            )}
          </Paper>
        </Grid>
        <Grid item={true} xs={6}>
          <Typography variant="overline" style={{ float: 'left' }}>
            {t('Polls')}
          </Typography>
          <CreateObjective exerciseId={exerciseId} />
          <div className="clearfix" />
          <Paper variant="outlined" classes={{ root: classes.paper }}>
            {objectives.length > 0 ? (
              <List style={{ padding: 0 }}>
                {objectives.map((objective) => (
                  <ListItem divider={true} key={objective.objective_id}>
                    <ListItemIcon>
                      <BallotOutlined />
                    </ListItemIcon>
                    <ListItemText
                      primary={objective.objective_title}
                      secondary={objective.objective_description}
                    />
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        width: 200,
                        marginRight: 1,
                      }}
                    >
                      <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress variant="determinate" value={50} />
                      </Box>
                      <Box sx={{ minWidth: 35 }}>
                        <Typography variant="body2" color="text.secondary">
                          50%
                        </Typography>
                      </Box>
                    </Box>
                    <ListItemSecondaryAction>
                      <ObjectivePopover
                        exerciseId={exerciseId}
                        objective={objective}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Empty message={t('No objectives in this exercise.')} />
            )}
          </Paper>
        </Grid>
      </Grid>
      <br />
      <div style={{ marginTop: 40 }}>
        <Typography variant="overline" style={{ float: 'left' }}>
          {t('Exercise logs')}
        </Typography>
        <IconButton
          color="secondary"
          onClick={handleToggleWrite}
          style={{ margin: '-3px 0 0 5px' }}
        >
          <EditOutlined fontSize="small" />
        </IconButton>
        {logs.map((log) => (
          <Card
            key={log.log_id}
            classes={{ root: classes.card }}
            raised={false}
            variant="outlined"
          >
            <CardHeader
              style={{
                padding: '7px 10px 2px 15px',
                borderBottom: `1px solid ${theme.palette.divider}`,
              }}
              action={<LogPopover exerciseId={exerciseId} log={log} />}
              title={
                <div>
                  <div
                    style={{
                      float: 'left',
                      fontDecoration: 'none',
                      textTransform: 'none',
                      paddingTop: 2,
                    }}
                  >
                    <strong>{resolveUserName(log.user)}</strong>&nbsp;
                    <span style={{ color: theme.palette.text.secondary }}>
                      {t('added an entry')} on {nsdt(log.log_created_at)}
                    </span>
                  </div>
                  <div
                    style={{
                      float: 'left',
                      marginLeft: 20,
                      fontDecoration: 'none',
                      textTransform: 'none',
                    }}
                  >
                    <ItemTags tags={log.tags || []} />
                  </div>
                </div>
              }
            />
            <CardContent>
              <strong>{log.log_title}</strong>
              <p>{log.log_content}</p>
            </CardContent>
          </Card>
        ))}
        <Accordion
          style={{ margin: `${logs.length > 0 ? '30' : '5'}px 0 30px 0` }}
          expanded={open}
          onChange={handleToggleWrite}
          variant="outlined"
        >
          <AccordionSummary expandIcon={<ExpandMoreOutlined />}>
            <Typography className={classes.heading}>
              <RateReviewOutlined />
              &nbsp;&nbsp;&nbsp;&nbsp;
              <span style={{ fontWeight: 500 }}>{t('Write an entry')}</span>
            </Typography>
          </AccordionSummary>
          <AccordionDetails style={{ width: '100%', paddingBottom: 80 }}>
            <LogForm
              initialValues={{ log_tags: [] }}
              onSubmit={submitCreateLog}
              handleClose={() => setOpen(false)}
            />
          </AccordionDetails>
        </Accordion>
        <div style={{ marginTop: 100 }} />
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default Lessons;
