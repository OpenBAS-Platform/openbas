import React, { useState } from 'react';
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
} from '@mui/icons-material';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import LinearProgress from '@mui/material/LinearProgress';
import * as R from 'ramda';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Chart from 'react-apexcharts';
import CreateObjective from './CreateObjective';
import { useFormatter } from '../../../../components/i18n';
import { useHelper } from '../../../../store';
import useDataLoader from '../../../../utils/ServerSideEvent';
import { fetchObjectives } from '../../../../actions/Objective';
import Empty from '../../../../components/Empty';
import ObjectivePopover from './ObjectivePopover';
import { Transition } from '../../../../utils/Environment';
import ObjectiveEvaluations from './ObjectiveEvaluations';
import { isExerciseUpdatable } from '../../../../utils/Exercise';
import ResultsMenu from '../ResultsMenu';
import { fetchInjects } from '../../../../actions/Inject';
import { areaChartOptions } from '../../../../utils/Charts';
import CreateLessonsCategory from './categories/CreateLessonsCategory';

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
  paperChart: {
    position: 'relative',
    padding: '0 20px 0 0',
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
  const [selectedObjective, setSelectedObjective] = useState(null);
  // Fetching data
  const { exerciseId } = useParams();
  const { exercise, objectives, injects } = useHelper((helper) => {
    return {
      exercise: helper.getExercise(exerciseId),
      objectives: helper.getExerciseObjectives(exerciseId),
      injects: helper.getExerciseInjects(exerciseId),
    };
  });
  useDataLoader(() => {
    dispatch(fetchObjectives(exerciseId));
    dispatch(fetchInjects(exerciseId));
  });
  const sortedObjectives = R.sortWith(
    [R.ascend(R.prop('objective_priority'))],
    objectives,
  );
  const injectsData = R.pipe(
    R.filter((n) => n.inject_sent_at !== null),
    R.map((n) => {
      const date = new Date(n.inject_sent_at);
      date.setHours(0, 0, 0, 0);
      return R.assoc('inject_sent_at_date', date.toISOString(), n);
    }),
    R.groupBy(R.prop('inject_sent_at_date')),
    R.toPairs,
    R.map((n) => ({
      x: n[0],
      y: n[1].length,
    })),
  )(injects);
  const chartData = [
    {
      name: t('Number of inject'),
      data: injectsData,
    },
  ];
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
            <div className={classes.number}>
              {exercise.exercise_communications_number}
            </div>
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
        <Grid item={true} xs={6}>
          <Typography variant="h4">
            {t('Crisis intensity (injects by hour)')}
          </Typography>
          <Paper variant="outlined" classes={{ root: classes.paperChart }}>
            {injectsData.length > 0 ? (
              <Chart
                options={areaChartOptions(theme, true, nsdt, null, undefined)}
                series={chartData}
                type="area"
                width="100%"
                height={350}
              />
            ) : (
              <Empty
                message={t(
                  'No data to display or the exercise has not started yet',
                )}
              />
            )}
          </Paper>
        </Grid>
      </Grid>
      <br />
      <div style={{ marginTop: 40 }}>
        <Typography variant="h2" style={{ float: 'left' }}>
          {t('Participative lessons learned')}
        </Typography>
        <CreateLessonsCategory exerciseId={exerciseId} />
        <div className="clearfix" />
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
