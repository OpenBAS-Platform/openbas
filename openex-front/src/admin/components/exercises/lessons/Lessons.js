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
  ContentPasteGoOutlined,
  HelpOutlined,
  CastForEducationOutlined,
  DeleteSweepOutlined,
  VisibilityOutlined,
} from '@mui/icons-material';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Switch from '@mui/material/Switch';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import { Link, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import LinearProgress from '@mui/material/LinearProgress';
import * as R from 'ramda';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import Chart from 'react-apexcharts';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
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
import {
  applyLessonsTemplate,
  emptyLessonsCategories,
  fetchLessonsCategories,
  fetchLessonsQuestions,
  fetchLessonsTemplates,
  resetLessonsAnswers,
  sendLessons,
  updateLessonsCategoryAudiences,
} from '../../../../actions/Lessons';
import CreateLessonsQuestion from './categories/questions/CreateLessonsQuestion';
import LessonsQuestionPopover from './categories/questions/LessonsQuestionPopover';
import LessonsCategoryPopover from './categories/LessonsCategoryPopover';
import LessonsCategoryAddAudiences from './categories/LessonsCategoryAddAudiences';
import { fetchAudiences } from '../../../../actions/Audience';
import { truncate } from '../../../../utils/String';
import { updateExerciseLessons } from '../../../../actions/Exercise';
import SendLessonsForm from './SendLessonsForm';

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
  paperPadding: {
    position: 'relative',
    padding: '20px 20px 0 20px',
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
  chip: {
    margin: '0 10px 10px 0',
  },
}));

const Lessons = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const theme = useTheme();
  const { t, nsdt } = useFormatter();
  const [selectedObjective, setSelectedObjective] = useState(null);
  const [openApplyTemplate, setOpenApplyTemplate] = useState(false);
  const [openResetAnswers, setOpenResetAnswers] = useState(false);
  const [openEmptyLessons, setOpenEmptyLessons] = useState(false);
  const [openSendLessons, setOpenSendLessons] = useState(false);
  const [templateValue, setTemplateValue] = useState(null);
  const handleChange = (event) => {
    setTemplateValue(event.target.value);
  };
  // Fetching data
  const { exerciseId } = useParams();
  const {
    exercise,
    objectives,
    injects,
    audiencesMap,
    lessonsCategories,
    lessonsQuestions,
    lessonsTemplates,
  } = useHelper((helper) => {
    return {
      exercise: helper.getExercise(exerciseId),
      objectives: helper.getExerciseObjectives(exerciseId),
      injects: helper.getExerciseInjects(exerciseId),
      audiencesMap: helper.getAudiencesMap(),
      lessonsCategories: helper.getExerciseLessonsCategories(exerciseId),
      lessonsQuestions: helper.getExerciseLessonsQuestions(exerciseId),
      lessonsTemplates: helper.getLessonsTemplates(),
    };
  });
  useDataLoader(() => {
    dispatch(fetchLessonsTemplates());
    dispatch(fetchLessonsCategories(exerciseId));
    dispatch(fetchLessonsQuestions(exerciseId));
    dispatch(fetchObjectives(exerciseId));
    dispatch(fetchInjects(exerciseId));
    dispatch(fetchAudiences(exerciseId));
  });
  const applyTemplate = () => {
    return dispatch(applyLessonsTemplate(exerciseId, templateValue)).then(() => setOpenApplyTemplate(false));
  };
  const resetAnswers = () => {
    return dispatch(resetLessonsAnswers(exerciseId)).then(() => setOpenResetAnswers(false));
  };
  const emptyLessons = () => {
    return dispatch(emptyLessonsCategories(exerciseId)).then(() => setOpenEmptyLessons(false));
  };
  const toggleAnonymize = () => {
    return dispatch(
      updateExerciseLessons(exerciseId, {
        exercise_lessons_anonymized: !exercise.exercise_lessons_anonymized,
      }),
    );
  };
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
  const sortCategories = R.sortWith([
    R.ascend(R.prop('lessons_category_order')),
  ]);
  const sortQuestions = R.sortWith([
    R.ascend(R.prop('lessons_question_order')),
  ]);
  const sortedCategories = sortCategories(lessonsCategories);
  const getHoursDiff = (startDate, endDate) => {
    const msInHour = 1000 * 60 * 60;
    return Math.round(Math.abs(endDate - startDate) / msInHour);
  };
  const handleUpdateAudiences = (lessonsCategoryId, audiencesIds) => {
    const data = { lessons_category_audiences: audiencesIds };
    return dispatch(
      updateLessonsCategoryAudiences(exerciseId, lessonsCategoryId, data),
    );
  };
  const handleSubmitSendLessons = (data) => {
    return dispatch(sendLessons(exerciseId, data));
  };
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
      <Grid container={true} spacing={3}>
        <Grid item={true} xs={4}>
          <Typography variant="h4">{t('Details')}</Typography>
          <Paper variant="outlined" classes={{ root: classes.paperPadding }}>
            <Grid container={true} spacing={3}>
              <Grid item={true} xs={6}>
                <Typography variant="h3">{t('Start date')}</Typography>
                {nsdt(exercise.exercise_start_date)}
              </Grid>
              <Grid item={true} xs={6}>
                <Typography variant="h3">{t('End date')}</Typography>
                {nsdt(exercise.exercise_end_date)}
              </Grid>
              <Grid item={true} xs={6}>
                <Typography variant="h3">{t('Duration')}</Typography>
                {getHoursDiff(
                  exercise.exercise_start_date
                    ? new Date(exercise.exercise_start_date)
                    : new Date(),
                  exercise.exercise_end_date
                    ? new Date(exercise.exercise_end_date)
                    : new Date(),
                )}{' '}
                {t('hours')}
              </Grid>
              <Grid item={true} xs={6}>
                <Typography variant="h3">{t('Audience')}</Typography>
                {exercise.exercise_users_number} {t('players')}
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item={true} xs={4}>
          <Typography variant="h4">{t('Parameters')}</Typography>
          <Paper variant="outlined" classes={{ root: classes.paperPadding }}>
            <Grid container={true} spacing={3}>
              <Grid item={true} xs={6}>
                <Typography variant="h3">{t('Questionnaire mode')}</Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={exercise.exercise_lessons_anonymized}
                      onChange={toggleAnonymize}
                      name="anonymized"
                    />
                  }
                  label={t('Anonymize answers')}
                />
              </Grid>
              <Grid item={true} xs={6}>
                <Typography variant="h3">{t('Template')}</Typography>
                <Button
                  startIcon={<ContentPasteGoOutlined />}
                  color="primary"
                  variant="contained"
                  onClick={() => setOpenApplyTemplate(true)}
                >
                  {t('Apply')}
                </Button>
              </Grid>
              <Grid item={true} xs={6}>
                <Typography variant="h3">{t('Check')}</Typography>
                <Button
                  startIcon={<VisibilityOutlined />}
                  color="secondary"
                  variant="contained"
                  component={Link}
                  to={`/lessons/${exerciseId}?preview=true`}
                >
                  {t('Preview')}
                </Button>
              </Grid>
              <Grid item={true} xs={6}>
                <Typography variant="h3">
                  {t('Categories and questions')}
                </Typography>
                <Button
                  startIcon={<DeleteSweepOutlined />}
                  color="error"
                  variant="contained"
                  onClick={() => setOpenEmptyLessons(true)}
                >
                  {t('Empty')}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid item={true} xs={4}>
          <Typography variant="h4">{t('Control')}</Typography>
          <Paper variant="outlined" classes={{ root: classes.paperPadding }}>
            <Alert severity="info">
              {t(
                'Sending the questionnaire will emit an email to each player with a unique link to access and fill it.',
              )}
            </Alert>
            <Grid container={true} spacing={3} style={{ marginTop: 0 }}>
              <Grid item={true} xs={6}>
                <Typography variant="h3">{t('Questionnaire')}</Typography>
                <Button
                  startIcon={<ContentPasteGoOutlined />}
                  color="success"
                  variant="contained"
                  onClick={() => setOpenSendLessons(true)}
                >
                  {t('Send')}
                </Button>
              </Grid>
              <Grid item={true} xs={6}>
                <Typography variant="h3">{t('Answers')}</Typography>
                <Button
                  startIcon={<ContentPasteGoOutlined />}
                  color="error"
                  variant="contained"
                  onClick={() => setOpenResetAnswers(true)}
                >
                  {t('Reset')}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
      <Grid container={true} spacing={3} style={{ marginTop: 30 }}>
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
      <div style={{ marginTop: 40 }}>
        {sortedCategories.map((category) => {
          const questions = sortQuestions(
            lessonsQuestions.filter(
              (n) => n.lessons_question_category === category.lessonscategory_id,
            ),
          );
          return (
            <div key={category.lessonscategory_id} style={{ marginTop: 70 }}>
              <Typography variant="h2" style={{ float: 'left' }}>
                {category.lessons_category_name}
              </Typography>
              <LessonsCategoryPopover
                exerciseId={exerciseId}
                lessonsCategory={category}
              />
              <div className="clearfix" />
              <Grid container={true} spacing={3}>
                <Grid item={true} xs={4} style={{ marginTop: -10 }}>
                  <Typography variant="h4">{t('Questions')}</Typography>
                  <Paper
                    variant="outlined"
                    classes={{ root: classes.paper }}
                    style={{ marginTop: 14 }}
                  >
                    <List style={{ padding: 0 }}>
                      {questions.map((question) => (
                        <ListItem
                          key={question.lessonsquestion_id}
                          divider={true}
                        >
                          <ListItemIcon>
                            <HelpOutlined />
                          </ListItemIcon>
                          <ListItemText
                            style={{ width: '50%' }}
                            primary={question.lessons_question_content}
                            secondary={
                              question.lessons_question_explanation
                              || t('No explanation')
                            }
                          />
                          <ListItemSecondaryAction>
                            <LessonsQuestionPopover
                              exerciseId={exerciseId}
                              lessonsCategoryId={category.lessonscategory_id}
                              lessonsQuestion={question}
                            />
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                      <CreateLessonsQuestion
                        inline={true}
                        exerciseId={exerciseId}
                        lessonsCategoryId={category.lessonscategory_id}
                      />
                    </List>
                  </Paper>
                </Grid>
                <Grid item={true} xs={3} style={{ marginTop: -10 }}>
                  <Typography variant="h4" style={{ float: 'left' }}>
                    {t('Targeted audiences')}
                  </Typography>
                  <LessonsCategoryAddAudiences
                    exerciseId={exerciseId}
                    lessonsCategoryId={category.lessonscategory_id}
                    lessonsCategoryAudiencesIds={
                      category.lessons_category_audiences
                    }
                    handleUpdateAudiences={handleUpdateAudiences}
                  />
                  <div className="clearfix" />
                  <Paper
                    variant="outlined"
                    classes={{ root: classes.paperPadding }}
                  >
                    {category.lessons_category_audiences.map((audienceId) => {
                      const audience = audiencesMap[audienceId];
                      return (
                        <Tooltip
                          key={audienceId}
                          title={audience?.audience_name || ''}
                        >
                          <Chip
                            onDelete={() => handleUpdateAudiences(
                              category.lessonscategory_id,
                              R.filter(
                                (n) => n !== audienceId,
                                category.lessons_category_audiences,
                              ),
                            )
                            }
                            label={truncate(audience?.audience_name || '', 30)}
                            icon={<CastForEducationOutlined />}
                            classes={{ root: classes.chip }}
                          />
                        </Tooltip>
                      );
                    })}
                  </Paper>
                </Grid>
                <Grid item={true} xs={5} style={{ marginTop: -10 }}>
                  <Typography variant="h4">{t('Results')}</Typography>
                  <Paper variant="outlined" classes={{ root: classes.paper }}>
                    &nbsp;
                  </Paper>
                </Grid>
              </Grid>
            </div>
          );
        })}
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
      <Dialog
        TransitionComponent={Transition}
        keepMounted={false}
        open={openApplyTemplate}
        onClose={() => setOpenApplyTemplate(false)}
        fullWidth={true}
        maxWidth="md"
        PaperProps={{ elevation: 1 }}
      >
        <DialogTitle>{t('Apply a lessons learned template')}</DialogTitle>
        <DialogContent>
          <Alert severity="info">
            {t(
              'Applying a template will add all categories and questions of the selected template to this exercise.',
            )}
          </Alert>
          <FormControl style={{ margin: '10px 0 0 5px', width: '100%' }}>
            <RadioGroup
              style={{ width: '100%' }}
              aria-labelledby="controlled-radio-buttons-group"
              name="template"
              value={templateValue}
              onChange={handleChange}
            >
              {lessonsTemplates.map((template) => {
                return (
                  <FormControlLabel
                    key={template.lessonstemplate_id}
                    style={{
                      width: '100%',
                      borderBottom: `1px solid ${theme.palette.background.paper}`,
                    }}
                    value={template.lessonstemplate_id}
                    control={<Radio />}
                    label={
                      <div
                        style={{
                          margin: '15px 0 15px 10px',
                        }}
                      >
                        <Typography variant="h4">
                          {template.lessons_template_name}
                        </Typography>
                        <Typography variant="body2">
                          {template.lessons_template_description
                            || t('No description')}
                        </Typography>
                      </div>
                    }
                  />
                );
              })}
            </RadioGroup>
          </FormControl>
          <div className="clearfix" />
          <div style={{ float: 'right', marginTop: 20 }}>
            <Button
              onClick={() => setOpenApplyTemplate(false)}
              style={{ marginRight: 10 }}
            >
              {t('Cancel')}
            </Button>
            <Button
              color="secondary"
              onClick={applyTemplate}
              disabled={templateValue === null}
            >
              {t('Apply')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog
        open={openResetAnswers}
        TransitionComponent={Transition}
        onClose={() => setOpenResetAnswers(false)}
        PaperProps={{ elevation: 1 }}
      >
        <DialogContent>
          <DialogContentText>
            {t('Do you want to reset lessons learned answers?')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenResetAnswers(false)}>
            {t('Cancel')}
          </Button>
          <Button color="secondary" onClick={resetAnswers}>
            {t('Reset')}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openEmptyLessons}
        TransitionComponent={Transition}
        onClose={() => setOpenEmptyLessons(false)}
        PaperProps={{ elevation: 1 }}
      >
        <DialogContent>
          <DialogContentText>
            {t(
              'Do you want to empty lessons learned categories and questions?',
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEmptyLessons(false)}>
            {t('Cancel')}
          </Button>
          <Button color="secondary" onClick={emptyLessons}>
            {t('Empty')}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openSendLessons}
        TransitionComponent={Transition}
        onClose={() => setOpenSendLessons(false)}
        fullWidth={true}
        maxWidth="md"
        PaperProps={{ elevation: 1 }}
      >
        <DialogTitle>{t('Send the lessons learned questionnaire')}</DialogTitle>
        <DialogContent style={{ overflowX: 'hidden' }}>
          <SendLessonsForm
            onSubmit={handleSubmitSendLessons}
            initialValues={{
              // eslint-disable-next-line no-template-curly-in-string
              subject: t('[${exercise.name}] Lessons learned questionnaire'),
              body: `${t('Hello')},<br /><br />${t(
                // eslint-disable-next-line no-template-curly-in-string
                'We would like thank your for your participation in this exercise. You are kindly requested to fill this lessons learned questionnaire: <a href="${lessons_uri}">${lessons_uri}</a>.',
              )}<br /><br />${t('Best regards')},<br />${t(
                'The exercise control team',
              )}`,
            }}
            handleClose={() => setOpenSendLessons(false)}
          />
        </DialogContent>
      </Dialog>
      <CreateLessonsCategory exerciseId={exerciseId} />
    </div>
  );
};

export default Lessons;
