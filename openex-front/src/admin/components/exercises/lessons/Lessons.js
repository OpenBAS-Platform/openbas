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
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import CreateObjective from './CreateObjective';
import { useFormatter } from '../../../../components/i18n';
import { useHelper } from '../../../../store';
import useDataLoader from '../../../../utils/ServerSideEvent';
import { fetchObjectives } from '../../../../actions/Objective';
import Empty from '../../../../components/Empty';
import ObjectivePopover from './ObjectivePopover';
import { addLog, fetchLogs } from '../../../../actions/Log';
import LogPopover from './LogPopover';
import { resolveUserName } from '../../../../utils/String';
import ItemTags from '../../../../components/ItemTags';
import LogForm from './LogForm';
import { Transition } from '../../../../utils/Environment';
import ObjectiveEvaluations from './ObjectiveEvaluations';
import { isExerciseUpdatable } from '../../../../utils/Exercise';
import ResultsMenu from '../ResultsMenu';

const useStyles = makeStyles((theme) => ({
  container: {
    margin: '10px 0 50px 0',
    padding: '0 200px 0 0',
  },
  metric: {
    position: 'relative',
    padding: 20,
    height: 100,
    overflow: 'hidden',
  },
  title: {
    textTransform: 'uppercase',
    fontSize: 12,
    fontWeight: 500,
    color: theme.palette.text.secondary,
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
  const [openCreateLog, setOpenCreateLog] = useState(false);
  const [selectedObjective, setSelectedObjective] = useState(null);
  const bottomRef = useRef(null);
  // Fetching data
  const { exerciseId } = useParams();
  const { exercise, objectives, logs, usersMap } = useHelper(
    (helper) => {
      return {
        exercise: helper.getExercise(exerciseId),
        objectives: helper.getExerciseObjectives(exerciseId),
        logs: helper.getExerciseLogs(exerciseId),
        usersMap: helper.getUsersMap(),
      };
    },
  );
  useDataLoader(() => {
    dispatch(fetchObjectives(exerciseId));
    dispatch(fetchLogs(exerciseId));
  });
  const scrollToBottom = () => {
    setTimeout(() => {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }, 400);
  };
  const handleToggleWrite = () => setOpenCreateLog(!openCreateLog);
  useEffect(() => {
    if (openCreateLog) {
      scrollToBottom();
    }
  }, [openCreateLog]);
  const submitCreateLog = (data, action) => {
    const inputValues = R.pipe(
      R.assoc('log_tags', R.pluck('id', data.log_tags)),
    )(data);
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
  const sortedObjectives = R.sortWith(
    [R.ascend(R.prop('objective_priority'))],
    objectives,
  );
  return (
    <div className={classes.container}>
      <ResultsMenu exerciseId={exerciseId} />
      <Grid container={true} spacing={3} style={{ marginTop: -14 }}>
        <Grid item={true} xs={3} style={{ marginTop: -14 }}>
          <Paper variant="outlined" classes={{ root: classes.metric }}>
            <div className={classes.icon}>
              <SportsScoreOutlined color="primary" sx={{ fontSize: 50 }} />
            </div>
            <div className={classes.title}>{t('Overall objectives score')}</div>
            <div className={classes.number}>{exercise.exercise_score}%</div>
          </Paper>
        </Grid>
        <Grid item={true} xs={3} style={{ marginTop: -14 }}>
          <Paper variant="outlined" classes={{ root: classes.metric }}>
            <div className={classes.icon}>
              <SpeakerNotesOutlined color="primary" sx={{ fontSize: 50 }} />
            </div>
            <div className={classes.title}>{t('Exercise logs')}</div>
            <div className={classes.number}>
              {exercise.exercise_logs_number}
            </div>
          </Paper>
        </Grid>
        <Grid item={true} xs={3} style={{ marginTop: -14 }}>
          <Paper variant="outlined" classes={{ root: classes.metric }}>
            <div className={classes.icon}>
              <BallotOutlined color="primary" sx={{ fontSize: 50 }} />
            </div>
            <div className={classes.title}>{t('Poll replies')}</div>
            <div className={classes.number}>
              {exercise.exercise_answers_number}
            </div>
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
      <Grid container={true} spacing={3} style={{ marginTop: -10 }}>
        <Grid item={true} xs={6}>
          <Typography variant="h4" style={{ float: 'left' }}>
            {t('Objectives')}
          </Typography>
          {isExerciseUpdatable(exercise, true) && (
            <CreateObjective exerciseId={exerciseId} />
          )}
          <div className="clearfix" />
          <Paper variant="outlined" classes={{ root: classes.paper }}>
            {sortedObjectives.length > 0 ? (
              <List style={{ padding: 0 }}>
                {sortedObjectives.map((objective) => (
                  <ListItem
                    key={objective.objective_id}
                    divider={true}
                    button={true}
                    onClick={() => setSelectedObjective(objective.objective_id)}
                  >
                    <ListItemIcon>
                      <FlagOutlined />
                    </ListItemIcon>
                    <ListItemText
                      style={{ width: '50%' }}
                      primary={objective.objective_title}
                      secondary={objective.objective_description}
                    />
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '30%',
                        marginRight: 1,
                      }}
                    >
                      <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={objective.objective_score}
                        />
                      </Box>
                      <Box sx={{ minWidth: 35 }}>
                        <Typography variant="body2" color="text.secondary">
                          {objective.objective_score}%
                        </Typography>
                      </Box>
                    </Box>
                    <ListItemSecondaryAction>
                      <ObjectivePopover
                        exercise={exercise}
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
        <Typography variant="h4" style={{ float: 'left' }}>
          {t('Exercise logs')}
        </Typography>
        {isExerciseUpdatable(exercise, true) && (
          <IconButton
            color="secondary"
            onClick={handleToggleWrite}
            size="large"
            style={{ margin: '-15px 0 0 5px' }}
          >
            <EditOutlined fontSize="small" />
          </IconButton>
        )}
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
                      paddingTop: 7,
                      fontSize: 15,
                    }}
                  >
                    <strong>
                      {resolveUserName(usersMap[log.log_user] ?? {})}
                    </strong>
                    &nbsp;
                    <span style={{ color: theme.palette.text.secondary }}>
                      {t('added an entry on')} {nsdt(log.log_created_at)}
                    </span>
                  </div>
                  <div
                    style={{
                      float: 'left',
                      margin: '4px 0 0 20px',
                      fontDecoration: 'none',
                      textTransform: 'none',
                    }}
                  >
                    <ItemTags tags={log.log_tags} />
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
        {isExerciseUpdatable(exercise, true) && (
          <Accordion
            style={{ margin: `${logs.length > 0 ? '30' : '5'}px 0 30px 0` }}
            expanded={openCreateLog}
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
                handleClose={() => setOpenCreateLog(false)}
              />
            </AccordionDetails>
          </Accordion>
        )}
        <div style={{ marginTop: 100 }} />
        <div ref={bottomRef} />
      </div>
      <Dialog
        TransitionComponent={Transition}
        keepMounted={false}
        open={selectedObjective !== null}
        onClose={() => setSelectedObjective(null)}
        fullWidth={true}
        maxWidth="md"
        PaperProps={{ elevation: 1 }}
      >
        <DialogTitle>{t('Objective achievement evaluation')}</DialogTitle>
        <DialogContent>
          <ObjectiveEvaluations
            objectiveId={selectedObjective}
            handleClose={() => setSelectedObjective(null)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Lessons;
