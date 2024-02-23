import React, { useEffect } from 'react';
import * as PropTypes from 'prop-types';
import * as R from 'ramda';
import { Link } from 'react-router-dom';
import { withStyles, withTheme } from '@mui/styles';
import { Grid, Paper, Card, CardContent, Typography, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { connect } from 'react-redux';
import { RowingOutlined, NotificationsOutlined, GroupsOutlined, ContactMailOutlined, Kayaking } from '@mui/icons-material';
import Chart from 'react-apexcharts';
import ItemTags from '../../components/ItemTags';
import MiniMap from './MiniMap';
import inject18n from '../../components/i18n';
import Countdown from '../../components/Countdown';
import { fetchStatistics } from '../../actions/Application';
import { fetchExercises } from '../../actions/Exercise';
import { fetchPlayers } from '../../actions/User';
import { fetchNextInjects } from '../../actions/Inject';
import { fetchTags } from '../../actions/Tag';
import { fetchOrganizations } from '../../actions/Organization';
import { storeHelper } from '../../actions/Schema';
import ItemNumberDifference from '../../components/ItemNumberDifference';
import Empty from '../../components/Empty';
import { colors, horizontalBarsChartOptions } from '../../utils/Charts';
import InjectIcon from './components/injects/InjectIcon';
import ProgressBarCountdown from '../../components/ProgressBarCountdown';
import { computeLevel } from '../../utils/Countries';

const styles = (theme) => ({
  root: {
    flexGrow: 1,
  },
  card: {
    width: '100%',
    borderRadius: 6,
    position: 'relative',
  },
  list: {
    padding: 0,
    height: 300,
    overflow: 'hidden',
  },
  paperMap: {
    padding: 0,
    height: 400,
    overflow: 'hidden',
  },
  paperChart: {
    position: 'relative',
    padding: '0 20px 0 0',
    overflow: 'hidden',
    height: 400,
  },
  number: {
    marginTop: 10,
    float: 'left',
    fontSize: 30,
  },
  title: {
    marginTop: 5,
    textTransform: 'uppercase',
    fontSize: 12,
    fontWeight: 500,
    color: theme.palette.text.secondary,
  },
  icon: {
    position: 'absolute',
    color: theme.palette.primary.main,
    top: 35,
    right: 20,
  },
  graphContainer: {
    width: '100%',
    padding: 0,
    overflow: 'hidden',
  },
  labelsCloud: {
    width: '100%',
    height: 300,
  },
  label: {
    width: '100%',
    height: 100,
    padding: 15,
  },
  labelNumber: {
    fontSize: 30,
    fontWeight: 500,
  },
  labelValue: {
    fontSize: 15,
  },
  item: {
    paddingLeft: 20,
    height: 50,
  },
  bodyItem: {
    fontSize: 13,
    float: 'left',
    width: '20%',
    height: 20,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  countdown: {
    fontWeight: 600,
  },
});

const Dashboard = (props) => {
  useEffect(() => {
    props.fetchStatistics();
    props.fetchOrganizations();
    props.fetchExercises();
    props.fetchTags();
    props.fetchNextInjects();
    props.fetchPlayers();
  }, []);
  const {
    classes,
    t,
    nsd,
    statistics,
    exercisesMap,
    organizations,
    theme,
    injects,
    users,
  } = props;
  const exercises = Object.values(exercisesMap);
  const mapIndexed = R.addIndex(R.map);
  const organizationsColors = R.pipe(
    mapIndexed((o, index) => [
      o.organization_id,
      colors(theme.palette.mode === 'dark' ? 400 : 600)[index],
    ]),
    R.fromPairs,
  )(organizations);
  const topOrganizations = R.pipe(
    R.sortWith([R.descend(R.prop('organization_injects_number'))]),
    R.take(7),
  )(organizations || []);
  const distributionChartData = [
    {
      name: t('Number of injects'),
      data: topOrganizations.map((o) => ({
        x: o.organization_name,
        y: o.organization_injects_number,
        fillColor: organizationsColors[o.organization_id],
      })),
    },
  ];
  const maxInjectsNumber = Math.max(
    ...topOrganizations.map((a) => a.organization_injects_number),
  );
  const usersByLocation = R.pipe(
    R.filter((n) => n.user_country !== null),
    R.groupBy(R.prop('user_country')),
    R.toPairs,
    R.map((n) => ({ country: n[0], number: n[1].length })),
  )(users);
  const min = Math.min(...R.pluck('number', usersByLocation));
  const max = Math.max(...R.pluck('number', usersByLocation));
  const usersByLocationLevels = R.indexBy(
    R.prop('country'),
    R.map(
      (n) => R.assoc('level', computeLevel(n.number, min, max), n),
      usersByLocation,
    ),
  );
  return (
    <div className={classes.root}>
      <Grid container={true} spacing={3}>
        <Grid item={true} xs={3}>
          <Card
            classes={{ root: classes.card }}
            style={{ height: 110 }}
            variant="outlined"
          >
            <CardContent>
              <div className={classes.icon}>
                <RowingOutlined color="primary" fontSize="large" />
              </div>
              <div className={classes.title}>{t('Exercises')}</div>
              <div className={classes.number}>
                {statistics?.exercises_count?.global_count ?? '-'}
              </div>
              <ItemNumberDifference
                difference={statistics?.exercises_count?.progression_count ?? 0}
                description={t('one month')}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item={true} xs={3}>
          <Card
            classes={{ root: classes.card }}
            style={{ height: 110 }}
            variant="outlined"
          >
            <CardContent>
              <div className={classes.icon}>
                <GroupsOutlined color="primary" fontSize="large" />
              </div>
              <div className={classes.title}>{t('Players')}</div>
              <div className={classes.number}>
                {statistics?.users_count?.global_count ?? '-'}
              </div>
              <ItemNumberDifference
                difference={statistics?.users_count?.progression_count ?? 0}
                description={t('one month')}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item={true} xs={3}>
          <Card
            classes={{ root: classes.card }}
            style={{ height: 110 }}
            variant="outlined"
          >
            <CardContent>
              <div className={classes.icon}>
                <NotificationsOutlined color="primary" fontSize="large" />
              </div>
              <div className={classes.title}>{t('Injects')}</div>
              <div className={classes.number}>
                {statistics?.injects_count?.global_count ?? '-'}
              </div>
              <ItemNumberDifference
                difference={statistics?.injects_count?.progression_count ?? 0}
                description={t('one month')}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item={true} xs={3}>
          <Card
            classes={{ root: classes.card }}
            style={{ height: 110 }}
            variant="outlined"
          >
            <CardContent>
              <div className={classes.icon}>
                <ContactMailOutlined color="primary" fontSize="large" />
              </div>
              <div className={classes.title}>{t('Messages')}</div>
              <div className={classes.number}>-</div>
              <ItemNumberDifference
                difference={0}
                description={t('one month')}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item={true} xs={6}>
          <Typography variant="h4">{t('Recent exercises')}</Typography>
          <Paper variant="outlined" classes={{ root: classes.list }}>
            {exercises.length > 0 ? (
              <List style={{ paddingTop: 0 }}>
                {R.take(6, exercises).map((exercise) => (
                  <ListItem
                    key={exercise.exercise_id}
                    button={true}
                    classes={{ root: classes.item }}
                    divider={true}
                    component={Link}
                    to={`/admin/exercises/${exercise.exercise_id}`}
                  >
                    <ListItemIcon>
                      <Kayaking />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <div>
                          <div
                            className={classes.bodyItem}
                            style={{ width: '40%' }}
                          >
                            {exercise.exercise_name}
                          </div>
                          <div
                            className={classes.bodyItem}
                            style={{ width: '20%' }}
                          >
                            {exercise.exercise_start_date ? (
                              nsd(exercise.exercise_start_date)
                            ) : (
                              <i>{t('Manual')}</i>
                            )}
                          </div>
                          <div
                            className={classes.bodyItem}
                            style={{ width: '40%' }}
                          >
                            <ItemTags
                              variant="list"
                              tags={exercise.exercise_tags}
                            />
                          </div>
                        </div>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Empty message={t('No exercises in this platform.')} />
            )}
          </Paper>
        </Grid>
        <Grid item={true} xs={6}>
          <Typography variant="h4">{t('Next injects to send')}</Typography>
          <Paper variant="outlined" classes={{ root: classes.list }}>
            {injects?.length > 0 ? (
              <List style={{ paddingTop: 0 }}>
                {injects.map((inject) => {
                  const exercise = exercisesMap[inject.inject_exercise];
                  return (
                    <ListItem
                      key={inject.inject_id}
                      dense={true}
                      classes={{ root: classes.item }}
                      divider={true}
                      button={true}
                      component={Link}
                      to={`/admin/exercises/${inject.inject_exercise}/animation/timeline`}
                    >
                      <ListItemIcon style={{ paddingTop: 5 }}>
                        <InjectIcon
                          type={inject.inject_type}
                          variant="inline"
                          disabled={!inject.inject_enabled}
                        />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <div>
                            <div
                              className={classes.bodyItem}
                              style={{ width: '50%' }}
                            >
                              {inject.inject_title}
                            </div>
                            <div
                              className={classes.bodyItem}
                              style={{ width: '25%', paddingTop: 8 }}
                            >
                              <ProgressBarCountdown
                                date={inject.inject_date}
                                paused={
                                  exercise?.exercise_status === 'PAUSED'
                                  || exercise?.exercise_status === 'CANCELED'
                                }
                              />
                            </div>
                            <div
                              className={classes.bodyItem}
                              style={{
                                paddingTop: 3,
                                marginRight: 15,
                                float: 'right',
                                paddingRight: 20,
                                fontFamily: 'Consolas, monaco, monospace',
                                fontSize: 12,
                              }}
                            >
                              <Countdown
                                date={inject.inject_date}
                                paused={exercise?.exercise_status === 'PAUSED'}
                              />
                            </div>
                          </div>
                        }
                      />
                    </ListItem>
                  );
                })}
              </List>
            ) : (
              <Empty message={t('No injects to send in this platform.')} />
            )}
          </Paper>
        </Grid>
        <Grid item={true} xs={6}>
          <Typography variant="h4">
            {t('Organizations distribution across exercises')}
          </Typography>
          <Paper variant="outlined" classes={{ root: classes.paperChart }}>
            {topOrganizations.length > 0 ? (
              <Chart
                options={horizontalBarsChartOptions(
                  theme,
                  maxInjectsNumber < 2,
                )}
                series={distributionChartData}
                type="bar"
                width="100%"
                height={50 + topOrganizations.length * 50}
              />
            ) : (
              <Empty message={t('No organizations in this platform.')} />
            )}
          </Paper>
        </Grid>
        <Grid item={true} xs={6}>
          <Typography variant="h4">{t('Players distribution')}</Typography>
          <Paper variant="outlined" classes={{ root: classes.paperMap }}>
            <MiniMap
              center={[48.8566969, 2.3514616]}
              zoom={2}
              usersByLocationLevels={usersByLocationLevels}
            />
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

Dashboard.propTypes = {
  classes: PropTypes.object,
  theme: PropTypes.object,
  t: PropTypes.func,
  fetchStatistics: PropTypes.func,
  fetchExercises: PropTypes.func,
  fetchTags: PropTypes.func,
  fetchNextInjects: PropTypes.func,
  injects: PropTypes.array,
  users: PropTypes.array,
  statistics: PropTypes.object,
};

const select = (state) => {
  const helper = storeHelper(state);
  return {
    exercisesMap: helper.getExercisesMap(),
    organizations: helper.getOrganizations(),
    statistics: helper.getStatistics(),
    injects: helper.getNextInjects(),
    users: helper.getUsers(),
  };
};

export default R.compose(
  connect(select, {
    fetchStatistics,
    fetchExercises,
    fetchTags,
    fetchOrganizations,
    fetchNextInjects,
    fetchPlayers,
  }),
  inject18n,
  withTheme,
  withStyles(styles),
)(Dashboard);
