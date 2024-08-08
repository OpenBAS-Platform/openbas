import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { makeStyles, useTheme } from '@mui/styles';
import * as R from 'ramda';
import { Link, useParams } from 'react-router-dom';
import { Form } from 'react-final-form';
import { Paper, Grid, Button, Typography, Dialog, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { useHelper } from '../../../store';
import { useQueryParameter } from '../../../utils/Environment';
import { useFormatter } from '../../../components/i18n';
import { usePermissions } from '../../../utils/Exercise';
import { fetchMe } from '../../../actions/Application';
import Loader from '../../../components/Loader';
import Empty from '../../../components/Empty';
import { addLessonsAnswers, fetchPlayerLessonsAnswers, fetchPlayerLessonsCategories, fetchPlayerLessonsQuestions } from '../../../actions/Lessons';
import { fetchPlayerExercise } from '../../../actions/Exercise';
import SliderField from '../../../components/fields/SliderField';
import OldTextField from '../../../components/fields/OldTextField';
import Transition from '../../../components/common/Transition';

const useStyles = makeStyles(() => ({
  root: {
    position: 'relative',
    flexGrow: 1,
    padding: 20,
  },
  logo: {
    width: 100,
    margin: '0px 0px 10px 0px',
  },
  container: {
    margin: '0 auto',
    width: '90%',
  },
  paper: {
    position: 'relative',
    padding: '10px 15px 20px 15px',
    overflow: 'hidden',
  },
}));

const LessonsPlayer = () => {
  const theme = useTheme();
  const classes = useStyles();
  const dispatch = useDispatch();
  const { t } = useFormatter();
  const { exerciseId } = useParams();
  const [openValidate, setOpenValidate] = useState(false);
  const [userId] = useQueryParameter(['user']);
  const { me, exercise, lessonsCategories, lessonsQuestions, lessonsAnswers } = useHelper((helper) => {
    const currentUser = helper.getMe();
    return {
      me: currentUser,
      exercise: helper.getExercise(exerciseId),
      lessonsCategories: helper.getExerciseLessonsCategories(exerciseId),
      lessonsQuestions: helper.getExerciseLessonsQuestions(exerciseId),
      lessonsAnswers: helper.getExerciseUserLessonsAnswers(
        exerciseId,
        userId && userId !== 'null' ? userId : currentUser?.user_id,
      ),
    };
  });
  const finalUserId = userId && userId !== 'null' ? userId : me?.user_id;
  // Pass the full exercise because the exercise is never loaded in the store at this point
  const permissions = usePermissions(exerciseId, exercise);
  useEffect(() => {
    dispatch(fetchMe());
    dispatch(fetchPlayerExercise(exerciseId, userId));
    dispatch(fetchPlayerLessonsCategories(exerciseId, finalUserId));
    dispatch(fetchPlayerLessonsQuestions(exerciseId, finalUserId));
    dispatch(fetchPlayerLessonsAnswers(exerciseId, finalUserId));
  }, []);
  const validate = (values) => {
    const errors = {};
    const requiredFields = R.flatten(
      lessonsQuestions.map((question) => [
        `${question.lessonsquestion_id}_score`,
      ]),
    );
    requiredFields.forEach((field) => {
      if (!values[field] && values[field] !== 0) {
        errors[field] = t('This field is required.');
      }
    });

    return errors;
  };
  const submitForm = (data) => {
    return Promise.all(
      lessonsQuestions.map((question) => {
        const answerData = {
          lessons_answer_score: data[`${question.lessonsquestion_id}_score`],
          lessons_answer_positive:
            data[`${question.lessonsquestion_id}_positive`],
          lessons_answer_negative:
            data[`${question.lessonsquestion_id}_nagative`],
        };
        return dispatch(
          addLessonsAnswers(
            exerciseId,
            question.lessons_question_category,
            question.lessonsquestion_id,
            answerData,
            finalUserId,
          ),
        );
      }),
    ).then(() => {
      setOpenValidate(false);
      dispatch(fetchPlayerLessonsAnswers(exerciseId, finalUserId));
    });
  };
  const sortCategories = R.sortWith([
    R.ascend(R.prop('lessons_category_order')),
  ]);
  const sortQuestions = R.sortWith([
    R.ascend(R.prop('lessons_question_order')),
  ]);
  const sortedCategories = sortCategories(
    R.filter(
      (n) => n.lessons_category_users.includes(finalUserId),
      lessonsCategories,
    ),
  );
  const initialValues = R.pipe(
    R.map((n) => ({
      [`${n.lessons_answer_question}_score`]: n.lessons_answer_score,
      [`${n.lessons_answer_question}_positive`]: n.lessons_answer_positive,
      [`${n.lessons_answer_question}_negative`]: n.lessons_answer_negative,
    })),
    R.mergeAll,
  )(lessonsAnswers);
  if (exercise) {
    return (
      <div className={classes.root}>
        {permissions.isLoggedIn && permissions.canRead && (
          <Button
            color="secondary"
            variant="outlined"
            component={Link}
            to={`/lessons/${exerciseId}?user=${finalUserId}&preview=true`}
            style={{ position: 'absolute', top: 20, right: 20 }}
          >
            {t('Switch to preview mode')}
          </Button>
        )}
        {permissions.isLoggedIn && permissions.canRead && (
          <Button
            color="primary"
            variant="outlined"
            component={Link}
            to={`/admin/exercises/${exerciseId}/lessons`}
            style={{ position: 'absolute', top: 20, left: 20 }}
          >
            {t('Back to administration')}
          </Button>
        )}
        <div className={classes.container}>
          <div style={{ margin: '0 auto', textAlign: 'center' }}>
            <img src={theme.logo} alt="logo" className={classes.logo} />
          </div>
          <Typography
            variant="h1"
            style={{
              textAlign: 'center',
              fontSize: 40,
            }}
          >
            {exercise.exercise_name}
          </Typography>
          <Typography
            variant="h2"
            style={{
              textAlign: 'center',
            }}
          >
            {exercise.exercise_subtitle}
          </Typography>
          {lessonsCategories.length === 0 && (
            <div style={{ marginTop: 150 }}>
              <Empty
                message={t(
                  'No lessons learned categories in this exercise yet.',
                )}
              />
            </div>
          )}
        </div>
        <Form
          keepDirtyOnReinitialize={true}
          initialValues={initialValues}
          onSubmit={submitForm}
          validate={validate}
        >
          {({ handleSubmit, submitting, errors }) => (
            <form id="lessonsAnswersForm" onSubmit={handleSubmit}>
              {sortedCategories.map((category) => {
                const questions = sortQuestions(
                  lessonsQuestions.filter(
                    (n) => n.lessons_question_category
                      === category.lessonscategory_id,
                  ),
                );
                return (
                  <div
                    key={category.lessonscategory_id}
                    style={{ marginTop: 70 }}
                  >
                    <Typography variant="h2">
                      {category.lessons_category_name}
                    </Typography>
                    {questions.map((question) => {
                      return (
                        <Paper
                          key={question.lessonsquestion_id}
                          variant="outlined"
                          classes={{ root: classes.paper }}
                          style={{ marginTop: 14 }}
                        >
                          <Grid
                            container={true}
                            spacing={3}
                            style={{ marginTop: -10 }}
                          >
                            <Grid item={true} xs={3}>
                              <Typography
                                variant="h4"
                                style={{ marginBottom: 15 }}
                              >
                                {t('Question')}
                              </Typography>
                              <Typography variant="body1">
                                <strong>
                                  {question.lessons_question_content}
                                </strong>
                              </Typography>
                              <Typography variant="body2">
                                {question.lessons_question_explanation
                                  || t('No explanation')}
                              </Typography>
                            </Grid>
                            <Grid item={true} xs={3}>
                              <Typography
                                variant="h4"
                                style={{ marginBottom: 15 }}
                              >
                                {t('Global evaluation')}
                              </Typography>
                              <Typography variant="body1">
                                {t(
                                  'Your overall evaluation about this question.',
                                )}
                              </Typography>
                              <SliderField
                                disabled={lessonsAnswers.length > 0}
                                name={`${question.lessonsquestion_id}_score`}
                                step={10}
                                min={0}
                                max={100}
                                defaultValue={0}
                              />
                            </Grid>
                            <Grid item={true} xs={3}>
                              <Typography variant="h4">
                                {t('What worked well')}
                              </Typography>
                              <OldTextField
                                disabled={lessonsAnswers.length > 0}
                                style={{ marginTop: 10 }}
                                name={`${question.lessonsquestion_id}_positive`}
                                label={t('Comment (optional)')}
                                multiline={true}
                                rows={2}
                                fullWidth={true}
                              />
                            </Grid>
                            <Grid item={true} xs={3}>
                              <Typography variant="h4">
                                {t("What didn't work well")}
                              </Typography>
                              <OldTextField
                                disabled={lessonsAnswers.length > 0}
                                style={{ marginTop: 10 }}
                                name={`${question.lessonsquestion_id}_negative`}
                                label={t('Comment (optional)')}
                                multiline={true}
                                fullWidth={true}
                                rows={2}
                              />
                            </Grid>
                          </Grid>
                        </Paper>
                      );
                    })}
                  </div>
                );
              })}
              <div style={{ margin: '50px auto', textAlign: 'center' }}>
                <Button
                  color="secondary"
                  variant="contained"
                  onClick={() => setOpenValidate(true)}
                  disabled={
                    lessonsAnswers.length > 0
                    || submitting
                    || Object.keys(errors).length > 0
                  }
                  size="large"
                >
                  {t('Submit')}
                </Button>
              </div>
              <Dialog
                open={openValidate}
                TransitionComponent={Transition}
                onClose={() => setOpenValidate(false)}
                PaperProps={{ elevation: 1 }}
              >
                <DialogContent>
                  <DialogContentText>
                    {t(
                      'Do you want to submit your answers? You will not be able to change them later.',
                    )}
                  </DialogContentText>
                </DialogContent>
                <DialogActions>
                  <Button
                    onClick={() => setOpenValidate(false)}
                    disabled={submitting}
                  >
                    {t('Cancel')}
                  </Button>
                  <Button
                    color="secondary"
                    onClick={handleSubmit}
                    disabled={submitting || Object.keys(errors).length > 0}
                  >
                    {t('Submit')}
                  </Button>
                </DialogActions>
              </Dialog>
            </form>
          )}
        </Form>
      </div>
    );
  }
  return <Loader />;
};

export default LessonsPlayer;
