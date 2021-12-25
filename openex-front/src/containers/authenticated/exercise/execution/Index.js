import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { interval } from 'rxjs';
import * as R from 'ramda';
import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';
import CircularProgress from '@material-ui/core/CircularProgress';
import { withStyles } from '@material-ui/core/styles';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import {
  EmailOutlined,
  InputOutlined,
  SmsOutlined,
  ScheduleOutlined,
  CancelOutlined,
  DoneAllOutlined,
} from '@material-ui/icons';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { equalsSelector } from '../../../../utils/Selectors';
import { i18nRegister } from '../../../../utils/Messages';
import { dateFormat, FIVE_SECONDS } from '../../../../utils/Time';
import { T } from '../../../../components/I18n';
import Countdown from '../../../../components/Countdown';
import { fetchGroups } from '../../../../actions/Group';
import { fetchAudiences } from '../../../../actions/Audience';
import { fetchAllInjects, fetchInjectTypes } from '../../../../actions/Inject';
import { downloadFile } from '../../../../actions/File';
import ExercisePopover from './ExercisePopover';
import InjectPopover from '../scenario/event/InjectPopover';
import InjectView from '../scenario/event/InjectView';
import InjectStatusView from './InjectStatusView';

const interval$ = interval(FIVE_SECONDS);

i18nRegister({
  fr: {
    'Next inject': 'La prochaine injection',
    Execution: 'Exécution',
    'Pending injects': 'Injections en attente',
    'Processed injects': 'Injections traitées',
    'You do not have any pending injects in this exercise.':
      "Vous n'avez aucune injection en attente dans cet exercice.",
    'You do not have any processed injects in this exercise.':
      "Vous n'avez aucune injection traitée dans cet exercice.",
    'Inject view': "Vue de l'injection",
    Status: 'Statut',
  },
});

const styles = () => ({
  title: {
    float: 'left',
    fontSize: '13px',
    textTransform: 'uppercase',
  },
  status: {
    float: 'right',
    fontSize: '15px',
    fontWeight: '600',
  },
  subtitle: {
    float: 'left',
    fontSize: '12px',
    color: '#848484',
    height: '29px',
  },
  state: {
    float: 'right',
  },
  empty: {
    marginTop: 40,
    fontSize: '18px',
    fontWeight: 500,
    textAlign: 'left',
  },
  inject_title: {
    float: 'left',
    padding: '5px 0 0 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  inject_date: {
    float: 'right',
    padding: '5px 30px 0 0',
  },
});

class IndexExecution extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openView: false,
      currentInject: {},
      openStatus: false,
      currentStatus: {},
    };
  }

  componentDidMount() {
    this.props.fetchGroups();
    this.props.fetchAudiences(this.props.exerciseId);
    this.props.fetchInjectTypes();
    this.subscription = interval$.subscribe(() => {
      this.props.fetchAllInjects(this.props.exerciseId, true);
    });
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  // eslint-disable-next-line class-methods-use-this
  selectIcon(type) {
    switch (type) {
      case 'openex_email':
        return <EmailOutlined />;
      case 'openex_ovh_sms':
        return <SmsOutlined />;
      case 'openex_manual':
        return <InputOutlined />;
      default:
        return <InputOutlined />;
    }
  }

  // eslint-disable-next-line class-methods-use-this
  selectStatus(status) {
    switch (status) {
      case 'SCHEDULED':
        return <ScheduleOutlined />;
      case 'RUNNING':
        return <CircularProgress size={20} color="primary" />;
      case 'FINISHED':
        return <DoneAllOutlined />;
      case 'CANCELED':
        return <CancelOutlined />;
      default:
        return <ScheduleOutlined />;
    }
  }

  handleOpenView(inject) {
    this.setState({ currentInject: inject, openView: true });
  }

  handleCloseView() {
    this.setState({ openView: false });
  }

  handleOpenStatus(inject) {
    this.setState({ currentStatus: inject, openStatus: true });
  }

  handleCloseStatus() {
    this.setState({ openStatus: false });
  }

  downloadAttachment(fileId, fileName) {
    return this.props.downloadFile(fileId, fileName);
  }

  render() {
    const { classes } = this.props;
    const exerciseStatus = R.propOr('SCHEDULED', 'exercise_status', this.props.exercise);
    const userCanUpdate = this.props.exercise?.user_can_update;
    const countdown = this.props.nextInject && (
      <Countdown targetDate={this.props.nextInject} />
    );
    const totalInjects = this.props.injectsPending.length + this.props.injectsProcessed.length;
    const processedInjects = this.props.injectsProcessed.length;
    const percent = Math.round((processedInjects * 100) / totalInjects);
    return (
      <div className={classes.container}>
        <Typography variant="h5" style={{ float: 'left' }}>
          <T>Execution</T>
        </Typography>
        {userCanUpdate && (
          <ExercisePopover
            exerciseId={this.props.exerciseId}
            exercise={this.props.exercise}
          />
        )}
        <div className={classes.status}>
          <T>{exerciseStatus}</T>
        </div>
        <div className="clearfix" />
        <div className={classes.subtitle}>
          {dateFormat(
            R.propOr(undefined, 'exercise_start_date', this.props.exercise),
          )}
          &nbsp;&rarr;&nbsp;
          {dateFormat(
            R.propOr(undefined, 'exercise_end_date', this.props.exercise),
          )}
        </div>
        <div className={classes.state}>{this.selectStatus(exerciseStatus)}</div>
        <div className="clearfix" />
        <br />
        <LinearProgress
          variant={
            this.props.injectsProcessed.length === 0
            && exerciseStatus === 'RUNNING'
              ? 'indeterminate'
              : 'determinate'
          }
          value={percent}
        />
        <Grid container={true} spacing={3} style={{ marginTop: 20 }}>
          <Grid item={true} xs={6}>
            <Typography variant="h6" style={{ float: 'left' }}>
              <T>Pending injects</T> {countdown}
            </Typography>
            <div className="clearfix" />
            {this.props.injectsPending.length === 0 && (
              <div className={classes.empty}>
                <T>You do not have any pending injects in this exercise.</T>
              </div>
            )}
            <List>
              {R.take(30, this.props.injectsPending).map((inject) => {
                const injectId = R.propOr(Math.random(), 'inject_id', inject);
                const injectTitle = R.propOr('-', 'inject_title', inject);
                const injectDate = R.prop('inject_date', inject);
                const injectType = R.propOr('-', 'inject_type', inject);
                const injectAudiences = R.propOr(
                  [],
                  'inject_audiences',
                  inject,
                );
                const injectSubaudiences = R.propOr(
                  [],
                  'inject_subaudiences',
                  inject,
                );
                const injectInProgress = R.path(['inject_status', 'status_name'], inject)
                  === 'PENDING';
                const injectIcon = injectInProgress ? (
                  <CircularProgress size={20} color="primary" />
                ) : (
                  this.selectIcon(injectType)
                );
                return (
                  <ListItem
                    key={injectId}
                    onClick={this.handleOpenView.bind(this, inject)}
                    divider={true}
                    button={true}
                  >
                    <ListItemIcon>{injectIcon}</ListItemIcon>
                    <ListItemText
                      primary={
                        <div>
                          <div className={classes.inject_title}>
                            {injectTitle}
                          </div>
                          <div className={classes.inject_date}>
                            {dateFormat(injectDate)}
                          </div>
                          <div className="clearfix" />
                        </div>
                      }
                    />
                    {!injectInProgress && userCanUpdate && (
                      <ListItemSecondaryAction>
                        <InjectPopover
                          exerciseId={this.props.exerciseId}
                          eventId={inject.inject_event}
                          incidentId={inject.inject_incident.incident_id}
                          inject={inject}
                          injectAudiencesIds={injectAudiences.map(
                            (a) => a.audience_id,
                          )}
                          injectSubaudiencesIds={injectSubaudiences.map(
                            (a) => a.subaudience_id,
                          )}
                          audiences={this.props.audiences}
                          subaudiences={R.values(this.props.subaudiences)}
                          inject_types={this.props.inject_types}
                          location="run"
                        />
                      </ListItemSecondaryAction>
                    )}
                  </ListItem>
                );
              })}
            </List>
            <Dialog
              open={this.state.openView}
              onClose={this.handleCloseView.bind(this)}
            >
              <DialogTitle>
                {R.propOr('-', 'inject_title', this.state.currentInject)}
              </DialogTitle>
              <DialogContent>
                <InjectView
                  downloadAttachment={this.downloadAttachment.bind(this)}
                  inject={this.state.currentInject}
                  audiences={this.props.audiences}
                  subaudiences={this.props.subaudiences}
                />
              </DialogContent>
              <DialogActions>
                <Button
                  variant="outlined"
                  onClick={this.handleCloseView.bind(this)}
                >
                  <T>Close</T>
                </Button>
              </DialogActions>
            </Dialog>
          </Grid>
          <Grid item={true} xs={6}>
            <Typography variant="h6" style={{ float: 'left' }}>
              <T>Processed injects</T>
            </Typography>
            <div className="clearfix" />
            {this.props.injectsProcessed.length === 0 && (
              <div className={classes.empty}>
                <T>You do not have any processed injects in this exercise.</T>
              </div>
            )}
            <List>
              {R.take(30, this.props.injectsProcessed).map((inject) => {
                let color = '#4CAF50';
                if (inject.inject_status.status_name === 'ERROR') {
                  color = '#F44336';
                } else if (inject.inject_status.status_name === 'PARTIAL') {
                  color = '#FF5722';
                }
                return (
                  <ListItem
                    key={inject.inject_id}
                    divider={true}
                    button={true}
                    onClick={this.handleOpenStatus.bind(this, inject)}
                  >
                    <ListItemIcon style={{ color }}>
                      {this.selectIcon(inject.inject_type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <div>
                          <div className={classes.inject_title}>
                            {inject.inject_title}
                          </div>
                          <div className={classes.inject_date}>
                            {dateFormat(inject.inject_date)}
                          </div>
                          <div className="clearfix" />
                        </div>
                      }
                    />
                  </ListItem>
                );
              })}
            </List>
            <Dialog
              open={this.state.openStatus}
              onClose={this.handleCloseStatus.bind(this)}
              fullWidth={true}
              maxWidth="md"
            >
              <DialogTitle>
                <T>Status</T>
              </DialogTitle>
              <DialogContent>
                <InjectStatusView inject={this.state.currentStatus} />
              </DialogContent>
              <DialogActions>
                <Button
                  variant="outlined"
                  onClick={this.handleCloseStatus.bind(this)}
                >
                  <T>Close</T>
                </Button>
              </DialogActions>
            </Dialog>
          </Grid>
        </Grid>
      </div>
    );
  }
}

IndexExecution.propTypes = {
  exerciseId: PropTypes.string,
  exercise: PropTypes.object,
  audiences: PropTypes.array,
  subaudiences: PropTypes.array,
  inject_types: PropTypes.object,
  injectsPending: PropTypes.array,
  injectsProcessed: PropTypes.array,
  nextInject: PropTypes.string,
  fetchGroups: PropTypes.func,
  fetchAllInjects: PropTypes.func,
  fetchAudiences: PropTypes.func,
  fetchInjectTypes: PropTypes.func,
  downloadFile: PropTypes.func,
};

const filterInjectsPending = (state, ownProps) => {
  const { injects } = state.referential.entities;
  const { id: exerciseId } = ownProps;
  const injectsFilterAndSorting = R.pipe(
    R.values,
    R.filter((n) => {
      const statusName = n.inject_status.status_name;
      const identifiedInject = n.inject_exercise === exerciseId;
      const isPendingInject = statusName === null || statusName === 'PENDING';
      return identifiedInject && isPendingInject;
    }),
    R.sortWith([R.ascend(R.prop('inject_date'))]),
  );
  return injectsFilterAndSorting(injects);
};

const nextInjectToExecute = (state, ownProps) => R.pipe(
  R.filter((n) => n.inject_enabled),
  R.head(),
  R.propOr(undefined, 'inject_date'),
)(filterInjectsPending(state, ownProps));

const filterInjectsProcessed = (state, ownProps) => {
  const { injects } = state.referential.entities;
  const { id: exerciseId } = ownProps;
  const injectsFilterAndSorting = R.pipe(
    R.values,
    R.filter(
      (n) => n.inject_exercise === exerciseId
        && (n.inject_status.status_name === 'SUCCESS'
          || n.inject_status.status_name === 'ERROR'
          || n.inject_status.status_name === 'PARTIAL'),
    ),
    R.sortWith([R.descend(R.prop('inject_date'))]),
  );
  return injectsFilterAndSorting(injects);
};

const filterAudiences = (state, ownProps) => {
  const { audiences } = state.referential.entities;
  const { id: exerciseId } = ownProps;
  const audiencesFilterAndSorting = R.pipe(
    R.values,
    R.filter((n) => n.audience_exercise === exerciseId),
    R.sortWith([R.ascend(R.prop('audience_name'))]),
  );
  return audiencesFilterAndSorting(audiences);
};

const exerciseSelector = (state, ownProps) => {
  const { id: exerciseId } = ownProps;
  return R.prop(exerciseId, state.referential.entities.exercises);
};

const select = () => equalsSelector({
  // Prevent view to refresh is nothing as changed (Using reselect)
  exerciseId: (state, ownProps) => ownProps.id,
  exercise: exerciseSelector,
  injectsPending: filterInjectsPending,
  nextInject: nextInjectToExecute,
  injectsProcessed: filterInjectsProcessed,
  audiences: filterAudiences,
  subaudiences: (state) => R.values(state.referential.entities.subaudiences),
  inject_types: (state) => state.referential.entities.inject_types,
});

export default R.compose(
  connect(select, {
    fetchGroups,
    fetchAudiences,
    fetchAllInjects,
    fetchInjectTypes,
    downloadFile,
  }),
  withStyles(styles),
)(IndexExecution);
