import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { makeStyles } from '@mui/styles';
import { Link, useParams } from 'react-router-dom';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import * as R from 'ramda';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Avatar from '@mui/material/Avatar';
import {
  CrisisAlertOutlined,
  DescriptionOutlined,
  EmojiEventsOutlined,
  OutlinedFlagOutlined,
  SportsScoreOutlined,
} from '@mui/icons-material';
import CardContent from '@mui/material/CardContent';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
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
import ExpandableMarkdown from '../../../components/ExpandableMarkdown';

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
    const groupChallenges = R.groupBy(R.prop('challenge_category'));
    const sortedChallenges = groupChallenges(challenges);
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
            {exercise.exercise_description}
          </Typography>
          {challenges.length === 0 && (
            <div style={{ marginTop: 150 }}>
              <Empty message={t('No challenge in this exercise yet.')} />
            </div>
          )}
          {Object.keys(sortedChallenges).map((category) => {
            return (
              <div key={category}>
                <Typography variant="h1" style={{ margin: '40px 0 30px 0' }}>
                  {category !== 'null' ? category : t('No category')}
                </Typography>
                <Grid container={true} spacing={3}>
                  {sortedChallenges[category].map((challenge) => {
                    return (
                      <Grid key={challenge.challenge_id} item={true} xs={4}>
                        <Card
                          classes={{ root: classes.card }}
                          sx={{ width: '100%', height: '100%' }}
                        >
                          <CardHeader
                            avatar={
                              <Avatar sx={{ bgcolor: '#e91e63' }}>
                                <EmojiEventsOutlined />
                              </Avatar>
                            }
                            title={challenge.challenge_name}
                            subheader={challenge.challenge_category}
                          />
                          <CardContent style={{ margin: '-20px 0 30px 0' }}>
                            <ExpandableMarkdown
                              source={challenge.challenge_content}
                              limit={500}
                              controlled={true}
                            />
                            <div className={classes.footer}>
                              <div style={{ float: 'left' }}>
                                {challenge.challenge_flags.map((flag) => {
                                  return (
                                    <Tooltip
                                      key={flag.flag_id}
                                      title={t(flag.flag_type)}
                                    >
                                      <Chip
                                        icon={<OutlinedFlagOutlined />}
                                        classes={{ root: classes.flag }}
                                        variant="outlined"
                                        label={t(flag.flag_type)}
                                      />
                                    </Tooltip>
                                  );
                                })}
                              </div>
                              <div style={{ float: 'right' }}>
                                <Button
                                  size="small"
                                  startIcon={<SportsScoreOutlined />}
                                  className={classes.button}
                                >
                                  {challenge.challenge_score || 0}
                                </Button>
                                <Button
                                  size="small"
                                  startIcon={<CrisisAlertOutlined />}
                                  className={classes.button}
                                >
                                  {challenge.challenge_max_attempts || 0}
                                </Button>
                                <Button
                                  size="small"
                                  startIcon={<DescriptionOutlined />}
                                  className={classes.button}
                                >
                                  {challenge.challenge_documents.length || 0}
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return <Loader />;
};

export default ChallengesPreview;
