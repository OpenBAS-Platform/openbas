import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { makeStyles } from '@mui/styles';
import { Link, useParams } from 'react-router-dom';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { fetchObserverChallenges } from '../../../actions/Challenge';
import { useHelper } from '../../../store';
import { useQueryParameter } from '../../../utils/Environment';
import { useFormatter } from '../../../components/i18n';
import { usePermissions } from '../../../utils/Exercise';
import { fetchMe } from '../../../actions/Application';
import { fetchPlayerDocuments } from '../../../actions/Document';
import Loader from '../../../components/Loader';
import Empty from '../../../components/Empty';
import logo from '../../../resources/images/logo.png';

const useStyles = makeStyles(() => ({
  root: {
    position: 'relative',
    flexGrow: 1,
    padding: 20,
  },
  logo: {
    width: 200,
    margin: '0px 0px 50px 0px',
  },
  container: {
    margin: '0 auto',
    width: 1200,
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
}));

const ChallengesPreview = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { t } = useFormatter();
  const [userId, challengeId] = useQueryParameter(['user', 'challenge']);
  const { exerciseId } = useParams();
  const { challengesReader } = useHelper((helper) => ({
    challengesReader: helper.getChallengesReader(exerciseId),
  }));
  const { exercise_information: exercise, exercise_challenges: challenges } = challengesReader ?? {};
  // Pass the full exercise because the exercise is never loaded in the store at this point
  const permissions = usePermissions(exerciseId, exercise);
  useEffect(() => {
    dispatch(fetchMe());
    dispatch(fetchObserverChallenges(exerciseId, userId));
    dispatch(fetchPlayerDocuments(exerciseId, userId));
  }, []);
  if (exercise) {
    return (
      <div className={classes.root}>
        {permissions.isLoggedIn && permissions.canRead && (
          <Button
            color="secondary"
            variant="outlined"
            component={Link}
            to={`/challenges/${exerciseId}?challenge=${challengeId}&user=${userId}&preview=false`}
            style={{ position: 'absolute', top: 20, right: 20 }}
          >
            {t('Switch to player mode')}
          </Button>
        )}
        <div className={classes.container}>
          <img src={logo} alt="logo" className={classes.logo} />
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
            {exercise.exercise_description}
          </Typography>
          {challenges.length === 0 && (
            <div style={{ marginTop: 150 }}>
              <Empty message={t('No challenge in this exercise yet.')} />
            </div>
          )}
        </div>
      </div>
    );
  }
  return <Loader />;
};

export default ChallengesPreview;
