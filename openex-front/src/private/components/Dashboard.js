import React, { useEffect } from 'react';
import * as PropTypes from 'prop-types';
import * as R from 'ramda';
import { Link } from 'react-router-dom';
import { withStyles, withTheme } from '@mui/styles';
import Grid from '@mui/material/Grid';
import { connect } from 'react-redux';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import {
  RowingOutlined,
  NotificationsOutlined,
  GroupsOutlined,
  ContactMailOutlined,
  Kayaking,
} from '@mui/icons-material';
import Chart from 'react-apexcharts';
import ItemTags from '../../components/ItemTags';
import MiniMap from './MiniMap';
import inject18n from '../../components/i18n';
import Countdown from '../../components/Countdown';
import { fetchStatistics } from '../../actions/Application';
import { fetchExercises } from '../../actions/Exercise';
import { fetchNextInjects } from '../../actions/Inject';
import { fetchTags } from '../../actions/Tag';
import { fetchOrganizations } from '../../actions/Organization';
import { storeBrowser } from '../../actions/Schema';
import ItemNumberDifference from '../../components/ItemNumberDifference';
import Empty from '../../components/Empty';
import { distributionChartOptions } from '../../utils/Charts';
import InjectIcon from './exercises/injects/InjectIcon';
import ProgressBarCountdown from '../../components/ProgressBarCountdown';

const styles = () => ({
  root: {
    flexGrow: 1,
  },
  metric: {
    position: 'relative',
    padding: 20,
    height: 100,
    overflow: 'hidden',
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
  title: {
    fontSize: 16,
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
  item: {
    height: 50,
    minHeight: 50,
    maxHeight: 50,
    paddingRight: 0,
  },
  bodyItem: {
    height: '100%',
    fontSize: 14,
    float: 'left',
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
  }, []);
  const {
    classes,
    t,
    nsd,
    statistics,
    exercises,
    organizations,
    theme,
    injects,
    browser,
  } = props;
  const topOrganizations = R.pipe(
    R.sortWith([R.descend(R.prop('organization_injects_number'))]),
    R.take(7),
  )(organizations || []);
  const distributionChartData = [
    {
      name: t('Number of injects'),
      data: topOrganizations.map((a) => ({
        x: a.organization_name,
        y: a.organization_injects_number,
      })),
    },
  ];
  const maxInjectsNumber = Math.max(
    ...topOrganizations.map((a) => a.organization_injects_number),
  );
  return (
    <div className={classes.root}>
      <Grid container={true} spacing={3}>
        <Grid item={true} xs={3}>
          <Paper variant="outlined" classes={{ root: classes.metric }}>
            <div className={classes.icon}>
              <RowingOutlined color="primary" sx={{ fontSize: 50 }} />
            </div>
            <div className={classes.title}>{t('Exercises')}</div>
            <div className={classes.number}>
              {statistics?.exercises_count?.global_count ?? '-'}
            </div>
            <ItemNumberDifference
              difference={statistics?.exercises_count?.progression_count ?? 0}
              description={t('one month')}
            />
          </Paper>
        </Grid>
        <Grid item={true} xs={3}>
          <Paper variant="outlined" classes={{ root: classes.metric }}>
            <div className={classes.icon}>
              <GroupsOutlined color="primary" sx={{ fontSize: 50 }} />
            </div>
            <div className={classes.title}>{t('Players')}</div>
            <div className={classes.number}>
              {statistics?.users_count?.global_count ?? '-'}
            </div>
            <ItemNumberDifference
              difference={statistics?.users_count?.progression_count ?? 0}
              description={t('one month')}
            />
          </Paper>
        </Grid>
        <Grid item={true} xs={3}>
          <Paper variant="outlined" classes={{ root: classes.metric }}>
            <div className={classes.icon}>
              <NotificationsOutlined color="primary" sx={{ fontSize: 50 }} />
            </div>
            <div className={classes.title}>{t('Injects')}</div>
            <div className={classes.number}>
              {statistics?.injects_count?.global_count ?? '-'}
            </div>
            <ItemNumberDifference
              difference={statistics?.injects_count?.progression_count ?? 0}
              description={t('one month')}
            />
          </Paper>
        </Grid>
        <Grid item={true} xs={3}>
          <Paper variant="outlined" classes={{ root: classes.metric }}>
            <div className={classes.icon}>
              <ContactMailOutlined color="primary" sx={{ fontSize: 50 }} />
            </div>
            <div className={classes.title}>{t('Messages')}</div>
            <div className={classes.number}>-</div>
            <ItemNumberDifference difference={0} description={t('one month')} />
          </Paper>
        </Grid>
        <Grid item={true} xs={6}>
          <Typography variant="h4">{t('Recent exercises')}</Typography>
          <Paper variant="outlined" classes={{ root: classes.list }}>
            {exercises.length > 0 ? (
              <List style={{ paddingTop: 0 }}>
                {R.take(6, exercises).map((exercise) => (
                  <ListItem
                    key={exercise.exercise_id}
                    dense={true}
                    button={true}
                    classes={{ root: classes.item }}
                    divider={true}
                    component={Link}
                    to={`/exercises/${exercise.exercise_id}`}
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
                            <ItemTags variant="list" tags={exercise.tags} />
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
          <Typography variant="h4">
            {t('Next injects to send')}
          </Typography>
          <Paper variant="outlined" classes={{ root: classes.list }}>
            {injects?.length > 0 ? (
              <List style={{ paddingTop: 0 }}>
                {injects.map((inject) => {
                  const exercise = browser.getExercise(inject.inject_exercise);
                  return (
                    <ListItem
                      key={inject.inject_id}
                      dense={true}
                      classes={{ root: classes.item }}
                      divider={true}
                      button={true}
                      component={Link}
                      to={`/exercises/${inject.inject_exercise}/animation`}
                    >
                      <ListItemIcon>
                        <InjectIcon
                          type={inject.inject_type}
                          variant="inline"
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
                options={distributionChartOptions(theme, maxInjectsNumber < 2)}
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
          <Typography variant="h4">
            {t('Players distribution')}
          </Typography>
          <Paper variant="outlined" classes={{ root: classes.paperMap }}>
            <MiniMap center={[48.8566969, 2.3514616]} zoom={2} />
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
  statistics: PropTypes.object,
  exercises: PropTypes.array,
  browser: PropTypes.object,
};

const select = (state) => {
  const browser = storeBrowser(state);
  return {
    exercises: browser.exercises,
    organizations: browser.organizations,
    statistics: browser.statistics,
    injects: browser.next_injects,
    browser,
  };
};

export default R.compose(
  connect(select, {
    fetchStatistics,
    fetchExercises,
    fetchTags,
    fetchOrganizations,
    fetchNextInjects,
  }),
  inject18n,
  withTheme,
  withStyles(styles),
)(Dashboard);
