import React from 'react';
import { makeStyles } from '@mui/styles';
import { Grid, Paper, Typography } from '@mui/material';
import { CastForEducationOutlined, ContactMailOutlined, GroupsOutlined, NotificationsOutlined } from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useFormatter } from '../../../../../components/i18n';
import { useHelper } from '../../../../../store';
import useDataLoader from '../../../../../utils/hooks/useDataLoader';
import ResultsMenu from '../ResultsMenu';
import { fetchExerciseInjects } from '../../../../../actions/Inject';
import { fetchExerciseChallenges } from '../../../../../actions/Challenge';
import { fetchExerciseInjectExpectations, fetchExerciseTeams } from '../../../../../actions/Exercise';
import { fetchPlayers } from '../../../../../actions/User';
import { fetchOrganizations } from '../../../../../actions/Organization';
import { fetchExerciseCommunications } from '../../../../../actions/Communication';
import DashboardDefinitionStatistics from '../dashboard/DashboardDefinitionStatistics';
import DashboardDefinitionScoreStatistics from '../dashboard/DashboardDefinitionScoreStatistics';
import DashboardDataStatistics from '../dashboard/DashboardDataStatistics';
import DashboardResultsStatistics from '../dashboard/DashboardResultsStatistics';
import { fetchReports } from '../../../../../actions/Report';
import Loader from '../../../../../components/Loader';
import ReportPopover from './ReportPopover';
import { fetchLessonsAnswers, fetchLessonsCategories, fetchLessonsQuestions } from '../../../../../actions/Lessons';
import { fetchObjectives } from '../../../../../actions/Objective';
import LessonsObjectives from '../../../lessons/LessonsObjectives';
import LessonsCategories from '../../../lessons/LessonsCategories';
import ExportButtons from '../../../../../components/ExportButtons';

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
  head: {
    margin: '20 auto',
    textAlign: 'center',
    fontSize: 25,
    fontWeight: 500,
  },
  subtitle: {
    margin: '0 auto',
    marginBottom: 40,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: 400,
  },
}));

const Dashboard = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { t } = useFormatter();
  // Fetching data
  const { exerciseId, reportId } = useParams();
  const {
    report,
    exercise,
    teams,
    injects,
    challengesMap,
    teamsMap,
    injectExpectations,
    injectsMap,
    usersMap,
    organizationsMap,
    organizations,
    communications,
    objectives,
    lessonsCategories,
    lessonsQuestions,
    lessonsAnswers,
  } = useHelper((helper) => {
    return {
      report: helper.getReport(reportId),
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
      communications: helper.getExerciseCommunications(exerciseId),
      objectives: helper.getExerciseObjectives(exerciseId),
      lessonsCategories: helper.getExerciseLessonsCategories(exerciseId),
      lessonsQuestions: helper.getExerciseLessonsQuestions(exerciseId),
      lessonsAnswers: helper.getExerciseLessonsAnswers(exerciseId),
    };
  });
  useDataLoader(() => {
    dispatch(fetchReports(exerciseId));
    dispatch(fetchExerciseTeams(exerciseId));
    dispatch(fetchExerciseInjects(exerciseId));
    dispatch(fetchExerciseChallenges(exerciseId));
    dispatch(fetchExerciseInjectExpectations(exerciseId));
    dispatch(fetchPlayers());
    dispatch(fetchExerciseCommunications(exerciseId));
    dispatch(fetchOrganizations());
    dispatch(fetchLessonsCategories(exerciseId));
    dispatch(fetchLessonsQuestions(exerciseId));
    dispatch(fetchLessonsAnswers(exerciseId));
    dispatch(fetchObjectives(exerciseId));
  });
  if (report) {
    return (
      <div className={classes.container}>
        <ResultsMenu exerciseId={exerciseId} />
        <ReportPopover exerciseId={exerciseId} report={report} />
        <div style={{ float: 'right' }}>
          <ExportButtons
            domElementId="report"
            name={report.report_name}
            pixelRatio={2}
          />
        </div>
        <div className="clearfix" />
        <div id="report">
          <div className={classes.head}>{report.report_name}</div>
          <div className="clearfix" />
          <div className={classes.subtitle}>{report.report_description}</div>
          {report.report_general_information && (
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
                    <NotificationsOutlined
                      color="primary"
                      sx={{ fontSize: 50 }}
                    />
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
                    <CastForEducationOutlined
                      color="primary"
                      sx={{ fontSize: 50 }}
                    />
                  </div>
                  <div className={classes.title}>{t('Teams')}</div>
                  <div className={classes.number}>
                    {(teams || []).length}
                  </div>
                </Paper>
              </Grid>
              <Grid item={true} xs={3} style={{ marginTop: -14 }}>
                <Paper variant="outlined" classes={{ root: classes.metric }}>
                  <div className={classes.icon}>
                    <ContactMailOutlined
                      color="primary"
                      sx={{ fontSize: 50 }}
                    />
                  </div>
                  <div className={classes.title}>{t('Messages')}</div>
                  <div className={classes.number}>
                    {exercise.exercise_communications_number}
                  </div>
                </Paper>
              </Grid>
            </Grid>
          )}
          {(report.report_stats_definition
            || report.report_stats_definition_score) && (
            <Typography variant="h1" style={{ marginTop: 40 }}>
              {t('Simulation definition and scenario')}
            </Typography>
          )}
          {report.report_stats_definition && (
            <DashboardDefinitionStatistics
              teams={teams}
              injects={injects}
            />
          )}
          {report.report_stats_definition_score && (
            <DashboardDefinitionScoreStatistics
              teams={teams}
              injects={injects}
              challengesMap={challengesMap}
            />
          )}
          {report.report_stats_data && (
            <Typography variant="h1" style={{ marginTop: 60 }}>
              {t('Simulation data')}
            </Typography>
          )}
          {report.report_stats_data && (
            <DashboardDataStatistics
              teams={teams}
              injects={injects}
              injectsMap={injectsMap}
              usersMap={usersMap}
              communications={communications}
            />
          )}
          {report.report_stats_results && (
            <Typography variant="h1" style={{ marginTop: 60 }}>
              {t('Simulation results')}
            </Typography>
          )}
          {report.report_stats_results && (
            <DashboardResultsStatistics
              usersMap={usersMap}
              injectsMap={injectsMap}
              teams={teams}
              teamsMap={teamsMap}
              injectExpectations={injectExpectations}
              organizations={organizations}
              organizationsMap={organizationsMap}
            />
          )}
          {(report.report_lessons_objectives
            || report.report_lessons_stats) && (
            <Typography variant="h1" style={{ marginTop: 60 }}>
              {t('Lessons learned')}
            </Typography>
          )}
          {report.report_lessons_objectives && (
            <LessonsObjectives
              objectives={objectives}
              injects={injects}
              isReport={true}
              exercise={exercise}
            />
          )}
          {report.report_lessons_stats && (
            <LessonsCategories
              exerciseId={exerciseId}
              lessonsCategories={lessonsCategories}
              lessonsAnswers={lessonsAnswers}
              isReport={true}
              lessonsQuestions={lessonsQuestions}
              teamsMap={teamsMap}
            />
          )}
        </div>
      </div>
    );
  }
  return <Loader />;
};

export default Dashboard;
