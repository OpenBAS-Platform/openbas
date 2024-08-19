import React, { useState } from 'react';
import { makeStyles, useTheme } from '@mui/styles';
import {
  Grid,
  Paper,
  Typography,
  Switch,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  Button,
  Alert,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  SportsScoreOutlined,
  SpeakerNotesOutlined,
  BallotOutlined,
  ContactMailOutlined,
  ContentPasteGoOutlined,
  DeleteSweepOutlined,
  VisibilityOutlined,
} from '@mui/icons-material';
import { Link, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import * as R from 'ramda';
import { useFormatter } from '../../../../../components/i18n';
import { useHelper } from '../../../../../store';
import useDataLoader from '../../../../../utils/hooks/useDataLoader';
import { fetchObjectives } from '../../../../../actions/Objective';
import Transition from '../../../../../components/common/Transition';
import ObjectiveEvaluations from './ObjectiveEvaluations';
import { fetchExerciseInjects } from '../../../../../actions/Inject';
import CreateLessonsCategory from './categories/CreateLessonsCategory';
import {
  applyLessonsTemplate,
  emptyLessonsCategories,
  fetchLessonsAnswers,
  fetchLessonsCategories,
  fetchLessonsQuestions,
  fetchLessonsTemplates,
  resetLessonsAnswers,
  sendLessons,
} from '../../../../../actions/Lessons';
import { resolveUserName } from '../../../../../utils/String';
import { fetchExerciseTeams, updateExerciseLessons } from '../../../../../actions/Exercise';
import SendLessonsForm from './SendLessonsForm';
import { fetchPlayers } from '../../../../../actions/User';
import LessonsObjectives from './LessonsObjectives';
import LessonsCategories from './LessonsCategories';
import CreateLessonsTemplate from '../../../components/lessons/CreateLessonsTemplate';
import { ExercisesHelper } from '../../../../../actions/exercises/exercise-helper';
import { TeamsHelper } from '../../../../../actions/teams/team-helper';
import { UserHelper } from '../../../../../actions/helper';
import { InjectHelper } from '../../../../../actions/injects/inject-helper';
import { LessonsTemplatesHelper } from '../../../../../actions/lessons/lesson-helper';

const useStyles = makeStyles((theme) => ({
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
}));

const Lessons = () => {
  // Standard hooks
  const classes = useStyles();
  const dispatch = useDispatch();
  const theme = useTheme();
  const { t, nsdt } = useFormatter();

  const [selectedObjective, setSelectedObjective] = useState(null);
  const [openApplyTemplate, setOpenApplyTemplate] = useState(false);
  const [openResetAnswers, setOpenResetAnswers] = useState(false);
  const [openEmptyLessons, setOpenEmptyLessons] = useState(false);
  const [openSendLessons, setOpenSendLessons] = useState(false);
  const [openAnonymize, setOpenAnonymize] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
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
    teamsMap,
    lessonsCategories,
    lessonsQuestions,
    lessonsAnswers,
    lessonsTemplates,
    usersMap,
  } = useHelper((helper: ExercisesHelper & InjectHelper & LessonsTemplatesHelper & TeamsHelper & UserHelper) => {
    return {
      exercise: helper.getExercise(exerciseId),
      objectives: helper.getExerciseObjectives(exerciseId),
      injects: helper.getExerciseInjects(exerciseId),
      teamsMap: helper.getTeamsMap(),
      lessonsCategories: helper.getExerciseLessonsCategories(exerciseId),
      lessonsQuestions: helper.getExerciseLessonsQuestions(exerciseId),
      lessonsAnswers: helper.getExerciseLessonsAnswers(exerciseId),
      lessonsTemplates: helper.getLessonsTemplates(),
      usersMap: helper.getUsersMap(),
    };
  });
  useDataLoader(() => {
    dispatch(fetchLessonsTemplates());
    dispatch(fetchLessonsCategories(exerciseId));
    dispatch(fetchLessonsQuestions(exerciseId));
    dispatch(fetchLessonsAnswers(exerciseId));
    dispatch(fetchObjectives(exerciseId));
    dispatch(fetchExerciseInjects(exerciseId));
    dispatch(fetchExerciseTeams(exerciseId));
    dispatch(fetchPlayers());
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
    ).then(() => setOpenAnonymize(false));
  };

  const handleSubmitSendLessons = (data) => {
    return dispatch(sendLessons(exerciseId, data)).then(() => setOpenSendLessons(false));
  };
  const answers = R.groupBy(R.prop('lessons_answer_question'), lessonsAnswers);
  const selectedQuestionAnswers = selectedQuestion && answers[selectedQuestion.lessonsquestion_id]
    ? answers[selectedQuestion.lessonsquestion_id]
    : [];
  const getHoursDiff = (startDate, endDate) => {
    const msInHour = 1000 * 60 * 60;
    return Math.round(Math.abs(endDate - startDate) / msInHour);
  };
  return (
    <div>
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
            <div className={classes.title}>{t('Simulation logs')}</div>
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
              {exercise.exercise_lessons_answers_number}
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
                <Typography variant="h3">{t('Team')}</Typography>
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
                      disabled={exercise.exercise_lessons_anonymized}
                      checked={exercise.exercise_lessons_anonymized}
                      onChange={() => setOpenAnonymize(true)}
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
                  {t('Clear out')}
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
      <br />
      <br />
      <LessonsObjectives
        objectives={objectives}
        injects={injects}
        setSelectedObjective={setSelectedObjective}
        exercise={exercise}
      />
      <LessonsCategories
        exerciseId={exerciseId}
        lessonsCategories={lessonsCategories}
        lessonsAnswers={lessonsAnswers}
        setSelectedQuestion={setSelectedQuestion}
        lessonsQuestions={lessonsQuestions}
        teamsMap={teamsMap}
      />
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
              'Applying a template will add all categories and questions of the selectedtemplate to this exercise.',
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
                      margin: 0,
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
          <CreateLessonsTemplate inline />
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
            {t('Clear out')}
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
                'We would like thank your for your participation in this simulation. You are kindly requested to fill this lessons learned questionnaire: <a href="${lessons_uri}">${lessons_uri}</a>.',
              )}<br /><br />${t('Best regards')},<br />${t(
                'The simulation control team',
              )}`,
            }}
            handleClose={() => setOpenSendLessons(false)}
          />
        </DialogContent>
      </Dialog>
      <Dialog
        open={selectedQuestion !== null}
        TransitionComponent={Transition}
        onClose={() => setSelectedQuestion(null)}
        PaperProps={{ elevation: 1 }}
        maxWidth="ld"
        fullWidth={true}
      >
        <DialogTitle>{selectedQuestion?.lessons_question_content}</DialogTitle>
        <DialogContent style={{ paddingTop: 20 }}>
          {selectedQuestionAnswers.map((answer) => (
            <div
              key={answer.lessonsanswer_id}
              style={{
                marginBottom: 70,
                borderBottom: `1px solid ${theme.palette.background.paper}`,
                paddingBottom: 10,
              }}
            >
              <Grid container={true} spacing={3}>
                <Grid item={true} xs={3} style={{ marginTop: -10 }}>
                  <Typography variant="h4">{t('User')}</Typography>
                  {exercise.exercise_lessons_anonymized
                    ? t('Anonymized')
                    : resolveUserName(usersMap[answer.lessons_answer_user])}
                </Grid>
                <Grid item={true} xs={3} style={{ marginTop: -10 }}>
                  <Typography variant="h4" style={{ marginBottom: 20 }}>
                    {t('Score')}
                  </Typography>
                  <div style={{ width: '80%', display: 'flex', alignItems: 'center' }}>
                    <LinearProgress
                      variant="determinate"
                      value={answer.lessons_answer_score}
                      style={{
                        flex: 1,
                        marginRight: 8,
                      }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {answer.lessons_answer_score}%
                    </Typography>
                  </div>
                </Grid>
                <Grid item={true} xs={3} style={{ marginTop: -10 }}>
                  <Typography variant="h4">{t('What worked well')}</Typography>
                  {answer.lessons_answer_positive}
                </Grid>
                <Grid item={true} xs={3} style={{ marginTop: -10 }}>
                  <Typography variant="h4">
                    {t("What didn't work well")}
                  </Typography>
                  {answer.lessons_answer_negative}
                </Grid>
              </Grid>
            </div>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedQuestion(null)}>
            {t('Close')}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={openAnonymize}
        TransitionComponent={Transition}
        onClose={() => setOpenAnonymize(false)}
        PaperProps={{ elevation: 1 }}
      >
        <DialogContent>
          <DialogContentText>
            {t('Do you want to anonymize lessons learned questionnaire?')}
          </DialogContentText>
          <Alert severity="warning" style={{ marginTop: 10 }}>
            {t('You will not be able to change this setting later.')}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEmptyLessons(false)}>
            {t('Cancel')}
          </Button>
          <Button color="secondary" onClick={toggleAnonymize}>
            {t('Anonymize')}
          </Button>
        </DialogActions>
      </Dialog>
      <CreateLessonsCategory exerciseId={exerciseId} />
    </div>
  );
};

export default Lessons;
