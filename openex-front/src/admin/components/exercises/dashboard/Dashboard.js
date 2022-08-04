import React from 'react';
import { makeStyles, useTheme } from '@mui/styles';
import * as R from 'ramda';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import {
  GroupsOutlined,
  NotificationsOutlined,
  ContactMailOutlined,
  CastForEducationOutlined,
} from '@mui/icons-material';
import Typography from '@mui/material/Typography';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import Chart from 'react-apexcharts';
import { useFormatter } from '../../../../components/i18n';
import { useHelper } from '../../../../store';
import useDataLoader from '../../../../utils/ServerSideEvent';
import { fetchAudiences } from '../../../../actions/Audience';
import ResultsMenu from '../ResultsMenu';
import {
  horizontalBarsChartOptions,
  lineChartOptions,
} from '../../../../utils/Charts';
import Empty from '../../../../components/Empty';
import { fetchInjects, fetchInjectTypes } from '../../../../actions/Inject';
import { fetchExerciseChallenges } from '../../../../actions/Challenge';
import { fetchExerciseInjectExpectations } from '../../../../actions/Exercise';

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
  paper2: {
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

const Dashboard = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const { t, nsdt, tPick } = useFormatter();
  const theme = useTheme();
  // Fetching data
  const { exerciseId } = useParams();
  const {
    exercise,
    audiences,
    injects,
    challengesMap,
    injectTypesMap,
    audiencesMap,
    injectExpectations,
    injectsMap,
  } = useHelper((helper) => {
    return {
      exercise: helper.getExercise(exerciseId),
      audiences: helper.getExerciseAudiences(exerciseId),
      audiencesMap: helper.getAudiencesMap(),
      injects: helper.getExerciseInjects(exerciseId),
      injectsMap: helper.getInjectsMap(),
      injectExpectations: helper.getExerciseInjectExpectations(exerciseId),
      challengesMap: helper.getChallengesMap(),
      injectTypesMap: helper.getInjectTypesMapByType(),
    };
  });
  useDataLoader(() => {
    dispatch(fetchAudiences(exerciseId));
    dispatch(fetchInjectTypes());
    dispatch(fetchInjects(exerciseId));
    dispatch(fetchExerciseChallenges(exerciseId));
    dispatch(fetchExerciseInjectExpectations(exerciseId));
  });
  const injectTypesWithScore = R.pipe(
    R.filter(
      (n) => n.inject_type === 'openex_challenge'
        || n.inject_content?.expectationScore,
    ),
    R.map((n) => {
      if (n.inject_type !== 'openex_challenge') {
        return R.assoc('inject_score', n.inject_content.expectationScore, n);
      }
      return R.assoc(
        'inject_score',
        R.sum(
          (n.inject_content?.challenges || []).map(
            (c) => challengesMap[c]?.challenge_score || 0,
          ),
        ),
        n,
      );
    }),
    R.groupBy(R.prop('inject_type')),
    R.toPairs,
    R.map((n) => ({
      inject_type: n[0],
      score: R.sum(n[1].map((i) => i.inject_score)),
      number: R.sum(n[1].map((i) => i.inject_expectations.length)),
    })),
  )(injects);
  const sortedInjectTypesWithScoreByNumber = R.pipe(
    R.sortWith([R.descend(R.prop('number'))]),
    R.take(10),
  )(injectTypesWithScore || []);
  const expectationsByInjectTypeData = [
    {
      name: t('Number of expectations'),
      data: sortedInjectTypesWithScoreByNumber.map((a) => ({
        x: tPick(injectTypesMap && injectTypesMap[a.inject_type]?.label),
        y: a.number,
        fillColor:
          injectTypesMap && injectTypesMap[a.inject_type]?.config?.color,
      })),
    },
  ];
  const sortedInjectTypesWithScoreByScore = R.pipe(
    R.sortWith([R.descend(R.prop('score'))]),
    R.take(10),
  )(injectTypesWithScore || []);
  const expectedScoreByInjectTypeData = [
    {
      name: t('Total expected score'),
      data: sortedInjectTypesWithScoreByScore.map((a) => ({
        x: tPick(injectTypesMap && injectTypesMap[a.inject_type]?.label),
        y: a.score,
        fillColor:
          injectTypesMap && injectTypesMap[a.inject_type]?.config?.color,
      })),
    },
  ];
  const sortedAudiencesByExpectation = R.pipe(
    R.sortWith([R.descend(R.prop('audience_injects_expectations_number'))]),
    R.take(10),
  )(audiences || []);
  const expectationsByAudienceData = [
    {
      name: t('Total expected score'),
      data: sortedAudiencesByExpectation.map((a) => ({
        x: a.audience_name,
        y: a.audience_injects_expectations_number,
      })),
    },
  ];
  const sortedAudiencesByExpectedScore = R.pipe(
    R.sortWith([
      R.descend(R.prop('audience_injects_expectations_total_expected_score')),
    ]),
    R.take(10),
  )(audiences || []);
  const expectedScoreByAudienceData = [
    {
      name: t('Total expected score'),
      data: sortedAudiencesByExpectedScore.map((a) => ({
        x: a.audience_name,
        y: a.audience_injects_expectations_total_expected_score,
      })),
    },
  ];
  let cumulation = 0;
  const audiencesScores = R.pipe(
    R.filter((n) => n.inject_expectation_result !== null),
    R.groupBy(R.prop('inject_expectation_audience')),
    R.toPairs,
    R.map((n) => {
      cumulation = 0;
      return [
        n[0],
        R.pipe(
          R.sortWith([R.ascend(R.prop('inject_expectation_updated_at'))]),
          R.map((i) => {
            cumulation += i.inject_expectation_score;
            return R.assoc('inject_expectation_cumulated_score', cumulation, i);
          }),
        )(n[1]),
      ];
    }),
    R.map((n) => ({
      name: audiencesMap[n[0]]?.audience_name,
      data: n[1].map((i) => ({
        x: i.inject_expectation_updated_at,
        y: i.inject_expectation_cumulated_score,
      })),
    })),
  )(injectExpectations);
  const injectsTypesScores = R.pipe(
    R.filter((n) => n.inject_expectation_result !== null),
    R.map((n) => R.assoc(
      'inject_expectation_inject',
      injectsMap[n.inject_expectation_inject] || {},
      n,
    )),
    R.groupBy(R.path(['inject_expectation_inject', 'inject_type'])),
    R.toPairs,
    R.map((n) => {
      cumulation = 0;
      return [
        n[0],
        R.pipe(
          R.sortWith([R.ascend(R.prop('inject_expectation_updated_at'))]),
          R.map((i) => {
            cumulation += i.inject_expectation_score;
            return R.assoc('inject_expectation_cumulated_score', cumulation, i);
          }),
        )(n[1]),
      ];
    }),
    R.map((n) => ({
      name: tPick(injectTypesMap && injectTypesMap[n[0]]?.label),
      data: n[1].map((i) => ({
        x: i.inject_expectation_updated_at,
        y: i.inject_expectation_cumulated_score,
      })),
    })),
  )(injectExpectations);
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
            <div className={classes.title}>{t('Audiences')}</div>
            <div className={classes.number}>{audiences.length}</div>
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
      <Grid container={true} spacing={3} style={{ marginTop: -10 }}>
        <Grid item={true} xs={3}>
          <Typography variant="h4">
            {t('Distribution of expectations by inject type')}
          </Typography>
          <Paper variant="outlined" classes={{ root: classes.paperChart }}>
            {injectTypesWithScore.length > 0 ? (
              <Chart
                options={horizontalBarsChartOptions(theme)}
                series={expectationsByInjectTypeData}
                type="bar"
                width="100%"
                height={50 + injectTypesWithScore.length * 50}
              />
            ) : (
              <Empty message={t('Exercise has no started yet')} />
            )}
          </Paper>
        </Grid>
        <Grid item={true} xs={3}>
          <Typography variant="h4">
            {t('Distribution of expected total score by inject type')}
          </Typography>
          <Paper variant="outlined" classes={{ root: classes.paperChart }}>
            {injectTypesWithScore.length > 0 ? (
              <Chart
                options={horizontalBarsChartOptions(theme)}
                series={expectedScoreByInjectTypeData}
                type="bar"
                width="100%"
                height={50 + injectTypesWithScore.length * 50}
              />
            ) : (
              <Empty message={t('Exercise has not started yet')} />
            )}
          </Paper>
        </Grid>
        <Grid item={true} xs={3}>
          <Typography variant="h4">
            {t('Distribution of expectations by audience')}
          </Typography>
          <Paper variant="outlined" classes={{ root: classes.paperChart }}>
            {sortedAudiencesByExpectation.length > 0 ? (
              <Chart
                options={horizontalBarsChartOptions(
                  theme,
                  false,
                  null,
                  null,
                  true,
                )}
                series={expectationsByAudienceData}
                type="bar"
                width="100%"
                height={50 + sortedAudiencesByExpectation.length * 50}
              />
            ) : (
              <Empty message={t('No audiences in this exercise.')} />
            )}
          </Paper>
        </Grid>
        <Grid item={true} xs={3}>
          <Typography variant="h4">
            {t('Distribution of expected total score by audience')}
          </Typography>
          <Paper variant="outlined" classes={{ root: classes.paperChart }}>
            {sortedAudiencesByExpectedScore.length > 0 ? (
              <Chart
                options={horizontalBarsChartOptions(
                  theme,
                  false,
                  null,
                  null,
                  true,
                )}
                series={expectedScoreByAudienceData}
                type="bar"
                width="100%"
                height={50 + sortedAudiencesByExpectedScore.length * 50}
              />
            ) : (
              <Empty message={t('No audiences in this exercise.')} />
            )}
          </Paper>
        </Grid>
      </Grid>
      <Typography variant="h1" style={{ marginTop: 60 }}>
        {t('Exercise results')}
      </Typography>
      <Grid container={true} spacing={3} style={{ marginTop: -10 }}>
        <Grid item={true} xs={6}>
          <Typography variant="h4">
            {t('Audiences scores over time')}
          </Typography>
          <Paper variant="outlined" classes={{ root: classes.paperChart }}>
            {audiencesScores.length > 0 ? (
              <Chart
                options={lineChartOptions(
                  theme,
                  true,
                  nsdt,
                  null,
                  undefined,
                  true,
                )}
                series={audiencesScores}
                type="line"
                width="100%"
                height={350}
              />
            ) : (
              <Empty message={t('Exercise has not started yet')} />
            )}
          </Paper>
        </Grid>
        <Grid item={true} xs={6}>
          <Typography variant="h4">
            {t('Inject types scores over time')}
          </Typography>
          <Paper variant="outlined" classes={{ root: classes.paperChart }}>
            {injectsTypesScores.length > 0 ? (
              <Chart
                options={lineChartOptions(
                  theme,
                  true,
                  nsdt,
                  null,
                  undefined,
                  true,
                )}
                series={injectsTypesScores}
                type="line"
                width="100%"
                height={350}
              />
            ) : (
              <Empty message={t('Exercise has not started yet')} />
            )}
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default Dashboard;
