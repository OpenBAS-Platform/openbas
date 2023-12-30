import React from 'react';
import { makeStyles } from '@mui/styles';
import { Grid, Paper, Typography } from '@mui/material';
import { GroupsOutlined, NotificationsOutlined, ContactMailOutlined, CastForEducationOutlined } from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useFormatter } from '../../../../components/i18n';
import { useHelper } from '../../../../store';
import useDataLoader from '../../../../utils/ServerSideEvent';
import { fetchTeams } from '../../../../actions/Team';
import ResultsMenu from '../ResultsMenu';
import { fetchInjects, fetchInjectTypes } from '../../../../actions/Inject';
import { fetchExerciseChallenges } from '../../../../actions/Challenge';
import { fetchExerciseInjectExpectations } from '../../../../actions/Exercise';
import { fetchPlayers } from '../../../../actions/User';
import { fetchOrganizations } from '../../../../actions/Organization';
import { fetchExerciseCommunications } from '../../../../actions/Communication';
import DashboardDefinitionStatistics from './DashboardDefinitionStatistics';
import DashboardDefinitionScoreStatistics from './DashboardDefinitionScoreStatistics';
import DashboardDataStatistics from './DashboardDataStatistics';
import DashboardResultsStatistics from './DashboardResultsStatistics';

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
}));

const Dashboard = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { t } = useFormatter();
  // Fetching data
  const { exerciseId } = useParams();
  const {
    exercise,
    teams,
    injects,
    challengesMap,
    injectTypesMap,
    teamsMap,
    injectExpectations,
    injectsMap,
    usersMap,
    organizationsMap,
    organizations,
    communications,
  } = useHelper((helper) => {
    return {
      exercise: helper.getExercise(exerciseId),
      teams: helper.getExerciseTeams(exerciseId),
      teamsMap: helper.getTeamsMap(),
      injects: helper.getExerciseInjects(exerciseId),
      injectsMap: helper.getInjectsMap(),
      usersMap: helper.getUsersMap(),
      organizations: helper.getOrganizations(),
      organizationsMap: helper.getOrganizationsMap(),
      injectExpectations: helper.getExerciseInjectExpectations(exerciseId),
      challengesMap: helper.getChallengesMap(),
      injectTypesMap: helper.getInjectTypesMapByType(),
      communications: helper.getExerciseCommunications(exerciseId),
    };
  });
  useDataLoader(() => {
    dispatch(fetchTeams(exerciseId));
    dispatch(fetchInjectTypes());
    dispatch(fetchInjects(exerciseId));
    dispatch(fetchExerciseChallenges(exerciseId));
    dispatch(fetchExerciseInjectExpectations(exerciseId));
    dispatch(fetchPlayers());
    dispatch(fetchExerciseCommunications(exerciseId));
    dispatch(fetchOrganizations());
  });
  return (
    <div className={classes.container}>
      <ResultsMenu exerciseId={exerciseId} />
      <Grid container={true} spacing={3} style={{ marginTop: -14 }}>
        <Grid item={true} xs={3} style={{ marginTop: -14 }}>
          <Paper variant="outlined" classes={{ root: classes.metric }}>
            <div className={classes.icon}>
              <GroupsOutlined color="primary" sx={{ fontSize: 50 }} />
            </div>
            <div className={classes.title}>{t('Players')}</div>
            <div className={classes.number}>
              {exercise.exercise_users_number}
            </div>
          </Paper>
        </Grid>
        <Grid item={true} xs={3} style={{ marginTop: -14 }}>
          <Paper variant="outlined" classes={{ root: classes.metric }}>
            <div className={classes.icon}>
              <NotificationsOutlined color="primary" sx={{ fontSize: 50 }} />
            </div>
            <div className={classes.title}>{t('Injects')}</div>
            <div className={classes.number}>
              {exercise.exercise_injects_statistics?.total_count ?? '-'}
            </div>
          </Paper>
        </Grid>
        <Grid item={true} xs={3} style={{ marginTop: -14 }}>
          <Paper variant="outlined" classes={{ root: classes.metric }}>
            <div className={classes.icon}>
              <CastForEducationOutlined color="primary" sx={{ fontSize: 50 }} />
            </div>
            <div className={classes.title}>{t('Teams')}</div>
            <div className={classes.number}>{(teams || []).length}</div>
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
      <Typography variant="h1" style={{ marginTop: 10 }}>
        {t('Exercise definition and scenario')}
      </Typography>
      <DashboardDefinitionStatistics
        teams={teams}
        injects={injects}
        injectTypesMap={injectTypesMap}
      />
      <DashboardDefinitionScoreStatistics
        teams={teams}
        injects={injects}
        injectTypesMap={injectTypesMap}
        challengesMap={challengesMap}
      />
      <Typography variant="h1" style={{ marginTop: 60 }}>
        {t('Exercise data')}
      </Typography>
      <DashboardDataStatistics
        teams={teams}
        injects={injects}
        injectsMap={injectsMap}
        usersMap={usersMap}
        communications={communications}
      />
      <Typography variant="h1" style={{ marginTop: 60 }}>
        {t('Exercise results')}
      </Typography>
      <DashboardResultsStatistics
        usersMap={usersMap}
        injectsMap={injectsMap}
        teams={teams}
        injectTypesMap={injectTypesMap}
        teamsMap={teamsMap}
        injectExpectations={injectExpectations}
        organizations={organizations}
        organizationsMap={organizationsMap}
      />
    </div>
  );
};

export default Dashboard;
