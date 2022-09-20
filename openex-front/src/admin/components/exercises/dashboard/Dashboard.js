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
  colors,
  horizontalBarsChartOptions,
  lineChartOptions,
} from '../../../../utils/Charts';
import Empty from '../../../../components/Empty';
import { fetchInjects, fetchInjectTypes } from '../../../../actions/Inject';
import { fetchExerciseChallenges } from '../../../../actions/Challenge';
import { fetchExerciseInjectExpectations } from '../../../../actions/Exercise';
import { fetchPlayers } from '../../../../actions/User';
import { fetchOrganizations } from '../../../../actions/Organization';
import { fetchExerciseCommunications } from '../../../../actions/Communication';
import { resolveUserName } from '../../../../utils/String';

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
    usersMap,
    organizationsMap,
    communications,
  } = useHelper((helper) => {
    return {
      exercise: helper.getExercise(exerciseId),
      audiences: helper.getExerciseAudiences(exerciseId),
      audiencesMap: helper.getAudiencesMap(),
      injects: helper.getExerciseInjects(exerciseId),
      communications: helper.getExerciseCommunications(exerciseId),
      injectsMap: helper.getInjectsMap(),
      usersMap: helper.getUsersMap(),
      organizationsMap: helper.getOrganizationsMap(),
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
    dispatch(fetchPlayers(exerciseId));
    dispatch(fetchExerciseCommunications(exerciseId));
    dispatch(fetchOrganizations());
  });
  const mapIndexed = R.addIndex(R.map);
  const audiencesColors = R.pipe(
    mapIndexed((a, index) => [
      a.audience_id,
      colors(theme.palette.mode === 'dark' ? 400 : 600)[index],
    ]),
    R.fromPairs,
  )(audiences);
  const sortedAudiencesByInjectsNumber = R.pipe(
    R.filter((n) => n.inject_sent_at !== null),
    R.sortWith([R.descend(R.prop('audience_injects_number'))]),
    R.take(10),
  )(audiences || []);
  const injectsByAudienceData = [
    {
      name: t('Number of injects'),
      data: sortedAudiencesByInjectsNumber.map((a) => ({
        x: a.audience_name,
        y: a.audience_injects_number,
        fillColor: audiencesColors[a.audience_id],
      })),
    },
  ];
  const injectsByType = R.pipe(
    R.filter((n) => n.inject_sent_at !== null),
    R.groupBy(R.prop('inject_type')),
    R.toPairs,
    R.map((n) => ({
      inject_type: n[0],
      number: n[1].length,
    })),
    R.sortWith([R.descend(R.prop('number'))]),
  )(injects);
  const injectsByInjectTypeData = [
    {
      name: t('Number of injects'),
      data: injectsByType.map((a) => ({
        x: tPick(injectTypesMap && injectTypesMap[a.inject_type]?.label),
        y: a.number,
        fillColor:
          injectTypesMap && injectTypesMap[a.inject_type]?.config?.color,
      })),
    },
  ];
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
      name: t('Number of expectations'),
      data: sortedAudiencesByExpectation.map((a) => ({
        x: a.audience_name,
        y: a.audience_injects_expectations_number,
        fillColor: audiencesColors[a.audience_id],
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
        fillColor: audiencesColors[a.audience_id],
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
      color: audiencesColors[n[0]],
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
      color: injectTypesMap && injectTypesMap[n[0]]?.config?.color,
      data: n[1].map((i) => ({
        x: i.inject_expectation_updated_at,
        y: i.inject_expectation_cumulated_score,
      })),
    })),
  )(injectExpectations);
  const injectsTotalScores = R.pipe(
    R.filter((n) => n.inject_expectation_result !== null),
    R.groupBy(R.prop('inject_expectation_inject')),
    R.toPairs,
    R.map((n) => ({
      ...injectsMap[n[0]],
      inject_total_score: R.sum(R.map((o) => o.inject_expectation_score, n[1])),
    })),
  )(injectExpectations);
  const sortedInjectsByTotalScore = R.pipe(
    R.sortWith([R.descend(R.prop('inject_total_score'))]),
    R.take(10),
  )(injectsTotalScores || []);
  const totalScoreByInjectData = [
    {
      name: t('Total score'),
      data: sortedInjectsByTotalScore.map((i) => ({
        x: i.inject_title,
        y: i.inject_total_score,
      })),
    },
  ];
  const audiencesTotalScores = R.pipe(
    R.filter((n) => n.inject_expectation_result !== null),
    R.groupBy(R.prop('inject_expectation_audience')),
    R.toPairs,
    R.map((n) => ({
      ...audiencesMap[n[0]],
      audience_total_score: R.sum(
        R.map((o) => o.inject_expectation_score, n[1]),
      ),
    })),
  )(injectExpectations);
  const sortedAudiencesByTotalScore = R.pipe(
    R.sortWith([R.descend(R.prop('audience_total_score'))]),
    R.take(10),
  )(audiencesTotalScores || []);
  const totalScoreByAudienceData = [
    {
      name: t('Total score'),
      data: sortedAudiencesByTotalScore.map((a) => ({
        x: a.audience_name,
        y: a.audience_total_score,
      })),
    },
  ];
  const organizationsTotalScores = R.pipe(
    R.filter(
      (n) => n.inject_expectation_result !== null
        && n.inject_expectation_user !== null,
    ),
    R.map((n) => R.assoc(
      'inject_expectation_user',
      usersMap[n.inject_expectation_user] || {},
      n,
    )),
    R.groupBy(R.path(['inject_expectation_user', 'user_organization'])),
    R.toPairs,
    R.map((n) => ({
      ...organizationsMap[n[0]],
      organization_total_score: R.sum(
        R.map((o) => o.inject_expectation_score, n[1]),
      ),
    })),
  )(injectExpectations);
  const sortedOrganizationsByTotalScore = R.pipe(
    R.sortWith([R.descend(R.prop('organization_total_score'))]),
    R.take(10),
  )(organizationsTotalScores || []);
  const totalScoreByOrganizationData = [
    {
      name: t('Total score'),
      data: sortedOrganizationsByTotalScore.map((o) => ({
        x: o.organization_name,
        y: o.organization_total_score,
      })),
    },
  ];
  const usersTotalScores = R.pipe(
    R.filter(
      (n) => n.inject_expectation_result !== null
        && n.inject_expectation_user !== null,
    ),
    R.groupBy(R.prop('inject_expectation_user')),
    R.toPairs,
    R.map((n) => ({
      ...usersMap[n[0]],
      user_total_score: R.sum(R.map((o) => o.inject_expectation_score, n[1])),
    })),
  )(injectExpectations);
  const sortedUsersByTotalScore = R.pipe(
    R.sortWith([R.descend(R.prop('user_total_score'))]),
    R.take(10),
  )(usersTotalScores || []);
  const totalScoreByUserData = [
    {
      name: t('Total score'),
      data: sortedUsersByTotalScore.map((u) => ({
        x: resolveUserName(u),
        y: u.user_total_score,
      })),
    },
  ];

  console.log(injects);
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
        <Grid item={true} xs={6}>
          <Typography variant="h4">
            {t('Distribution of injects by type')}
          </Typography>
          <Paper variant="outlined" classes={{ root: classes.paperChart }}>
            {injectsByType.length > 0 ? (
              <Chart
                options={horizontalBarsChartOptions(theme)}
                series={injectsByInjectTypeData}
                type="bar"
                width="100%"
                height={50 + injectsByType.length * 50}
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
        <Grid item={true} xs={6}>
          <Typography variant="h4">
            {t('Distribution of injects by audience')}
          </Typography>
          <Paper variant="outlined" classes={{ root: classes.paperChart }}>
            {sortedAudiencesByInjectsNumber.length > 0 ? (
              <Chart
                options={horizontalBarsChartOptions(theme)}
                series={injectsByAudienceData}
                type="bar"
                width="100%"
                height={50 + sortedAudiencesByInjectsNumber.length * 50}
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
        <Grid item={true} xs={3} style={{ marginTop: 30 }}>
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
              <Empty
                message={t(
                  'No data to display or the exercise has not started yet',
                )}
              />
            )}
          </Paper>
        </Grid>
        <Grid item={true} xs={3} style={{ marginTop: 30 }}>
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
              <Empty
                message={t(
                  'No data to display or the exercise has not started yet',
                )}
              />
            )}
          </Paper>
        </Grid>
        <Grid item={true} xs={3} style={{ marginTop: 30 }}>
          <Typography variant="h4">
            {t('Distribution of expectations by audience')}
          </Typography>
          <Paper variant="outlined" classes={{ root: classes.paperChart }}>
            {sortedAudiencesByExpectation.length > 0 ? (
              <Chart
                options={horizontalBarsChartOptions(theme)}
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
        <Grid item={true} xs={3} style={{ marginTop: 30 }}>
          <Typography variant="h4">
            {t('Distribution of expected total score by audience')}
          </Typography>
          <Paper variant="outlined" classes={{ root: classes.paperChart }}>
            {sortedAudiencesByExpectedScore.length > 0 ? (
              <Chart
                options={horizontalBarsChartOptions(theme)}
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
        {t('Exercise data')}
      </Typography>
      <Grid container={true} spacing={3} style={{ marginTop: -10 }}></Grid>
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
                  false,
                )}
                series={audiencesScores}
                type="line"
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
                  false,
                )}
                series={injectsTypesScores}
                type="line"
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
        <Grid item={true} xs={3} style={{ marginTop: 30 }}>
          <Typography variant="h4">
            {t('Distribution of total score by audience')}
          </Typography>
          <Paper variant="outlined" classes={{ root: classes.paperChart }}>
            {audiencesTotalScores.length > 0 ? (
              <Chart
                options={horizontalBarsChartOptions(theme)}
                series={totalScoreByAudienceData}
                type="bar"
                width="100%"
                height={50 + audiencesTotalScores.length * 50}
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
        <Grid item={true} xs={3} style={{ marginTop: 30 }}>
          <Typography variant="h4">
            {t('Distribution of total score by organization')}
          </Typography>
          <Paper variant="outlined" classes={{ root: classes.paperChart }}>
            {organizationsTotalScores.length > 0 ? (
              <Chart
                options={horizontalBarsChartOptions(theme)}
                series={totalScoreByOrganizationData}
                type="bar"
                width="100%"
                height={50 + organizationsTotalScores.length * 50}
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
        <Grid item={true} xs={3} style={{ marginTop: 30 }}>
          <Typography variant="h4">
            {t('Distribution of total score by player')}
          </Typography>
          <Paper variant="outlined" classes={{ root: classes.paperChart }}>
            {usersTotalScores.length > 0 ? (
              <Chart
                options={horizontalBarsChartOptions(theme)}
                series={totalScoreByUserData}
                type="bar"
                width="100%"
                height={50 + usersTotalScores.length * 50}
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
        <Grid item={true} xs={3} style={{ marginTop: 30 }}>
          <Typography variant="h4">
            {t('Distribution of total score by inject')}
          </Typography>
          <Paper variant="outlined" classes={{ root: classes.paperChart }}>
            {injectsTotalScores.length > 0 ? (
              <Chart
                options={horizontalBarsChartOptions(
                  theme,
                  false,
                  null,
                  null,
                  true,
                )}
                series={totalScoreByInjectData}
                type="bar"
                width="100%"
                height={50 + injectsTotalScores.length * 50}
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
    </div>
  );
};

export default Dashboard;
