import React, { useEffect } from 'react';
import * as PropTypes from 'prop-types';
import * as R from 'ramda';
import { Link } from 'react-router-dom';
import Countdown from 'react-countdown';
import { withStyles, withTheme } from '@mui/styles';
import Grid from '@mui/material/Grid';
import { connect } from 'react-redux';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import LinearProgress from '@mui/material/LinearProgress';
import {
  BarChart,
  Cell,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  RowingOutlined,
  NotificationsOutlined,
  GroupsOutlined,
  ContactMailOutlined,
  EventNoteOutlined,
} from '@mui/icons-material';
import ItemTags from '../../components/ItemTags';
import MiniMap from './MiniMap';
import inject18n from '../../components/i18n';
import { fetchStatistics } from '../../actions/Application';
import { fetchExercises } from '../../actions/Exercise';
import { storeBrowser } from '../../actions/Schema';
import ItemNumberDifference from '../../components/ItemNumberDifference';

const organizationsDistribution = [
  { label: 'Luatix', value: 54 },
  { label: 'ANSSI', value: 40 },
  { label: 'BNP Paribas', value: 20 },
  { label: 'Engie', value: 20 },
  { label: 'RTE', value: 20 },
  { label: 'SNCF', value: 20 },
];
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
  graph: {
    padding: '20px 20px 20px 0',
    height: 400,
    overflow: 'hidden',
  },
  map: {
    padding: 0,
    height: 400,
    overflow: 'hidden',
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
});

const Dashboard = (props) => {
  useEffect(() => {
    props.fetchStatistics();
    props.fetchExercises();
  }, []);
  const {
    theme, classes, t, nsd, statistics, exercises,
  } = props;
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
              difference={statistics?.exercises_count?.progression_count ?? '0'}
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
              difference={statistics?.users_count?.progression_count ?? '0'}
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
              difference={statistics?.injects_count?.progression_count ?? '0'}
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
          <Typography variant="overline">{t('Recent exercises')}</Typography>
          <Paper variant="outlined" classes={{ root: classes.list }}>
            <List style={{ paddingTop: 0 }}>
              {exercises.map((exercise) => (
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
                    <EventNoteOutlined />
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
                          style={{ width: '20%' }}
                        >
                          {exercise.exercise_end_date
                            ? nsd(exercise.exercise_end_date)
                            : '-'}
                        </div>
                        <div className={classes.bodyItem}>
                          <ItemTags variant="list" tags={exercise.getTags()} />
                        </div>
                      </div>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        <Grid item={true} xs={6}>
          <Typography variant="overline">
            {t('Next injects to send')}
          </Typography>
          <Paper variant="outlined" classes={{ root: classes.list }}>
            <List style={{ paddingTop: 0 }}>
              <ListItem
                dense={true}
                button={true}
                classes={{ root: classes.item }}
                divider={true}
                component={Link}
                to={'/exercises/'}
              >
                <ListItemIcon>
                  <NotificationsOutlined />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <div>
                      <div
                        className={classes.bodyItem}
                        style={{ width: '50%' }}
                      >
                        Alert in our SIEM about unsual traffic
                      </div>
                      <div
                        className={classes.bodyItem}
                        style={{ width: '25%', paddingTop: 8 }}
                      >
                        <LinearProgress
                          value={80}
                          variant="determinate"
                          style={{ width: '90%' }}
                        />
                      </div>
                      <div className={classes.bodyItem}>
                        <div style={{ fontSize: 12, paddingTop: 2 }}>
                          <Countdown date={Date.now() + 500000} />
                          <span className={classes.since}>
                            {t('before sending')}
                          </span>
                        </div>
                      </div>
                    </div>
                  }
                />
              </ListItem>
              <ListItem
                dense={true}
                button={true}
                classes={{ root: classes.item }}
                divider={true}
                component={Link}
                to={'/exercises/'}
              >
                <ListItemIcon>
                  <NotificationsOutlined />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <div>
                      <div
                        className={classes.bodyItem}
                        style={{ width: '50%' }}
                      >
                        Malware discovered on 3 endpoints in support team
                      </div>
                      <div
                        className={classes.bodyItem}
                        style={{ width: '25%', paddingTop: 8 }}
                      >
                        <LinearProgress
                          value={60}
                          variant="determinate"
                          style={{ width: '90%' }}
                        />
                      </div>
                      <div className={classes.bodyItem}>
                        <div style={{ fontSize: 12, paddingTop: 2 }}>
                          <Countdown date={Date.now() + 500000} />
                          <span className={classes.since}>
                            {t('before sending')}
                          </span>
                        </div>
                      </div>
                    </div>
                  }
                />
              </ListItem>
              <ListItem
                dense={true}
                button={true}
                classes={{ root: classes.item }}
                divider={true}
                component={Link}
                to={'/exercises/'}
              >
                <ListItemIcon>
                  <NotificationsOutlined />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <div>
                      <div
                        className={classes.bodyItem}
                        style={{ width: '50%' }}
                      >
                        Fire alarm has been triggered in building A
                      </div>
                      <div
                        className={classes.bodyItem}
                        style={{ width: '25%', paddingTop: 8 }}
                      >
                        <LinearProgress
                          value={50}
                          variant="determinate"
                          style={{ width: '90%' }}
                        />
                      </div>
                      <div className={classes.bodyItem}>
                        <div style={{ fontSize: 12, paddingTop: 2 }}>
                          <Countdown date={Date.now() + 700000} />
                          <span className={classes.since}>
                            {t('before sending')}
                          </span>
                        </div>
                      </div>
                    </div>
                  }
                />
              </ListItem>
              <ListItem
                dense={true}
                button={true}
                classes={{ root: classes.item }}
                divider={true}
                component={Link}
                to={'/exercises/'}
              >
                <ListItemIcon>
                  <NotificationsOutlined />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <div>
                      <div
                        className={classes.bodyItem}
                        style={{ width: '50%' }}
                      >
                        Threat intelligence report from an international partner
                      </div>
                      <div
                        className={classes.bodyItem}
                        style={{ width: '25%', paddingTop: 8 }}
                      >
                        <LinearProgress
                          value={50}
                          variant="determinate"
                          style={{ width: '90%' }}
                        />
                      </div>
                      <div className={classes.bodyItem}>
                        <div style={{ fontSize: 12, paddingTop: 2 }}>
                          <Countdown date={Date.now() + 800000} />
                          <span className={classes.since}>
                            {t('before sending')}
                          </span>
                        </div>
                      </div>
                    </div>
                  }
                />
              </ListItem>
              <ListItem
                dense={true}
                button={true}
                classes={{ root: classes.item }}
                divider={true}
                component={Link}
                to={'/exercises/'}
              >
                <ListItemIcon>
                  <NotificationsOutlined />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <div>
                      <div
                        className={classes.bodyItem}
                        style={{ width: '50%' }}
                      >
                        Terrorists posted an online video about the fire
                      </div>
                      <div
                        className={classes.bodyItem}
                        style={{ width: '25%', paddingTop: 8 }}
                      >
                        <LinearProgress
                          value={50}
                          variant="determinate"
                          style={{ width: '90%' }}
                        />
                      </div>
                      <div className={classes.bodyItem}>
                        <div style={{ fontSize: 12, paddingTop: 2 }}>
                          <Countdown date={Date.now() + 800000} />
                          <span className={classes.since}>
                            {t('before sending')}
                          </span>
                        </div>
                      </div>
                    </div>
                  }
                />
              </ListItem>
              <ListItem
                dense={true}
                button={true}
                classes={{ root: classes.item }}
                divider={true}
                component={Link}
                to={'/exercises/'}
              >
                <ListItemIcon>
                  <NotificationsOutlined />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <div>
                      <div
                        className={classes.bodyItem}
                        style={{ width: '50%' }}
                      >
                        New evidences found about the compromise of DCs
                      </div>
                      <div
                        className={classes.bodyItem}
                        style={{ width: '25%', paddingTop: 8 }}
                      >
                        <LinearProgress
                          value={50}
                          variant="determinate"
                          style={{ width: '90%' }}
                        />
                      </div>
                      <div className={classes.bodyItem}>
                        <div style={{ fontSize: 12, paddingTop: 2 }}>
                          <Countdown date={Date.now() + 900000} />
                          <span className={classes.since}>
                            {t('before sending')}
                          </span>
                        </div>
                      </div>
                    </div>
                  }
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
        <Grid item={true} xs={6}>
          <Typography variant="overline">
            {t('Organizations distribution across exercises')}
          </Typography>
          <Paper variant="outlined" classes={{ root: classes.graph }}>
            <ResponsiveContainer height={380} width="100%">
              <BarChart
                layout="vertical"
                data={organizationsDistribution}
                margin={{
                  top: 0,
                  right: 0,
                  bottom: 20,
                  left: 0,
                }}
              >
                <XAxis
                  type="number"
                  dataKey="value"
                  stroke={theme.palette.text.primary}
                  allowDecimals={false}
                />
                <YAxis
                  stroke={theme.palette.text.primary}
                  dataKey="label"
                  type="category"
                  angle={-30}
                  textAnchor="end"
                />
                <Tooltip
                  cursor={{
                    fill: 'rgba(0, 0, 0, 0.2)',
                    stroke: 'rgba(0, 0, 0, 0.2)',
                    strokeWidth: 2,
                  }}
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    fontSize: 12,
                    borderRadius: 10,
                  }}
                />
                <Bar dataKey="value" barSize={15}>
                  {organizationsDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={theme.palette.primary.main}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item={true} xs={6}>
          <Typography variant="overline">
            {t('Players distribution')}
          </Typography>
          <Paper variant="outlined" classes={{ root: classes.map }}>
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
  statistics: PropTypes.object,
  exercises: PropTypes.array,
};

const select = (state) => {
  const browser = storeBrowser(state);
  return {
    exercises: browser.getExercises(),
    statistics: browser.getStatistics(),
  };
};

export default R.compose(
  connect(select, { fetchStatistics, fetchExercises }),
  inject18n,
  withTheme,
  withStyles(styles),
)(Dashboard);
