import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { makeStyles } from '@mui/styles';
import * as R from 'ramda';
import { Link, useParams } from 'react-router-dom';
import { Form } from 'react-final-form';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Slide from '@mui/material/Slide';
import { useHelper } from '../../../store';
import { useQueryParameter } from '../../../utils/Environment';
import { useFormatter } from '../../../components/i18n';
import { usePermissions } from '../../../utils/Exercise';
import { fetchMe } from '../../../actions/Application';
import Loader from '../../../components/Loader';
import Empty from '../../../components/Empty';
import logo from '../../../resources/images/logo.png';
import {
  fetchLessonsCategories,
  fetchLessonsQuestions,
} from '../../../actions/Lessons';
import { fetchExercise } from '../../../actions/Exercise';
import { SliderField } from '../../../components/SliderField';
import { TextField } from '../../../components/TextField';

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

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
  card: {
    position: 'relative',
  },
  footer: {
    width: '100%',
    position: 'absolute',
    padding: '0 15px 0 15px',
    left: 0,
    bottom: 10,
  },
  paper: {
    position: 'relative',
    padding: '10px 15px 20px 15px',
    overflow: 'hidden',
  },
}));

const LessonsPlayer = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { t } = useFormatter();
  const [userId] = useQueryParameter(['user']);
  const { exerciseId } = useParams();
  const { exercise, lessonsCategories, lessonsQuestions } = useHelper(
    (helper) => ({
      exercise: helper.getExercise(exerciseId),
      lessonsCategories: helper.getExerciseLessonsCategories(exerciseId),
      lessonsQuestions: helper.getExerciseLessonsQuestions(exerciseId),
    }),
  );
  // Pass the full exercise because the exercise is never loaded in the store at this point
  const permissions = usePermissions(exerciseId, exercise);
  useEffect(() => {
    dispatch(fetchMe());
    dispatch(fetchExercise(exerciseId));
    dispatch(fetchLessonsCategories(exerciseId));
    dispatch(fetchLessonsQuestions(exerciseId));
  }, []);
  const validate = (values) => {
    const errors = {};
    const requiredFields = R.flatten(
      lessonsQuestions.map((question) => [
        `${question.lessonsquestion_id}_score`,
      ]),
    );
    requiredFields.forEach((field) => {
      if (!values[field]) {
        errors[field] = t('This field is required.');
      }
    });
    return errors;
  };
  const submitForm = () => {};
  const sortCategories = R.sortWith([
    R.ascend(R.prop('lessons_category_order')),
  ]);
  const sortQuestions = R.sortWith([
    R.ascend(R.prop('lessons_question_order')),
  ]);
  const sortedCategories = sortCategories(lessonsCategories);
  const initialValues = {};
  if (exercise) {
    return (
      <div className={classes.root}>
        {permissions.isLoggedIn && permissions.canRead && (
          <Button
            color="secondary"
            variant="outlined"
            component={Link}
            to={`/lessons/${exerciseId}?user=${userId}&preview=false`}
            style={{ position: 'absolute', top: 20, right: 20 }}
          >
            {t('Switch to player mode')}
          </Button>
        )}
        {permissions.isLoggedIn && permissions.canRead && (
          <Button
            color="primary"
            variant="outlined"
            component={Link}
            to={`/admin/exercises/${exerciseId}/results/lessons`}
            style={{ position: 'absolute', top: 20, left: 20 }}
          >
            {t('Back to administration')}
          </Button>
        )}
        <div className={classes.container}>
          <div style={{ margin: '0 auto', textAlign: 'center' }}>
            <img src={`/${logo}`} alt="logo" className={classes.logo} />
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
          {({ handleSubmit }) => (
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
                          variant="outlined"
                          classes={{ root: classes.paper }}
                          style={{ marginTop: 14 }}
                        >
                          <Grid
                            key={question.lessonsquestion_id}
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
                                name={`${question.lessonsquestion_id}_score`}
                                min={0}
                                max={10}
                              />
                            </Grid>
                            <Grid item={true} xs={3}>
                              <Typography variant="h4">
                                {t('What worked well')}
                              </Typography>
                              <TextField
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
                              <TextField
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
                <Button color="secondary" variant="contained" disabled={true}>
                  {t('Submit')}
                </Button>
              </div>
            </form>
          )}
        </Form>
      </div>
    );
  }
  return <Loader />;
};

export default LessonsPlayer;
