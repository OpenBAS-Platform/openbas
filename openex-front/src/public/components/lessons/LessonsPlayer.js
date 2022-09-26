import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { makeStyles } from '@mui/styles';
import { Link, useParams } from 'react-router-dom';
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
  fetchPlayerLessonsCategories,
  fetchPlayerLessonsQuestions,
} from '../../../actions/Lessons';
import { fetchPlayerExercise } from '../../../actions/Exercise';

const Transition = React.forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));
Transition.displayName = 'TransitionSlide';

const useStyles = makeStyles((theme) => ({
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
  flag: {
    fontSize: 12,
    float: 'left',
    marginRight: 7,
    maxWidth: 300,
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
  button: {
    cursor: 'default',
  },
  itemHead: {
    paddingLeft: 10,
    textTransform: 'uppercase',
    cursor: 'pointer',
  },
  item: {
    paddingLeft: 10,
    height: 50,
  },
  bodyItem: {
    height: '100%',
    fontSize: 13,
  },
  itemIcon: {
    color: theme.palette.primary.main,
  },
}));

const LessonsPlayer = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { t } = useFormatter();
  const [userId] = useQueryParameter(['user']);
  const { exerciseId } = useParams();
  const { exercise, lessonsCategories } = useHelper(
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
    dispatch(fetchPlayerExercise(exerciseId, userId));
    dispatch(fetchPlayerLessonsCategories(exerciseId, userId));
    dispatch(fetchPlayerLessonsQuestions(exerciseId, userId));
  }, []);
  if (exercise) {
    return (
      <div className={classes.root}>
        {permissions.isLoggedIn && permissions.canRead && (
          <Button
            color="secondary"
            variant="outlined"
            component={Link}
            to={`/lessons/${exerciseId}?user=${userId}&preview=true`}
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
      </div>
    );
  }
  return <Loader />;
};

export default LessonsPlayer;
