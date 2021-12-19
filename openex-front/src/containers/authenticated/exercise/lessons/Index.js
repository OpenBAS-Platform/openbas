import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { interval } from 'rxjs';
import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import LinearProgress from '@material-ui/core/LinearProgress';
import { LayersOutlined, DescriptionOutlined } from '@material-ui/icons';
import { dateFormat, FIVE_SECONDS } from '../../../../utils/Time';
import { T } from '../../../../components/I18n';
import { i18nRegister } from '../../../../utils/Messages';
import { fetchIncidents } from '../../../../actions/Incident';
import { fetchLogs } from '../../../../actions/Log';
import { fetchGroups } from '../../../../actions/Group';
import { equalsSelector } from '../../../../utils/Selectors';
import LogsPopover from './LogsPopover';
import LogPopover from './LogPopover';
import IncidentPopover from './IncidentPopover';
import OutcomeView from './OutcomeView';
import LogView from './LogView';

const interval$ = interval(FIVE_SECONDS);

i18nRegister({
  fr: {
    'Incidents outcomes': 'Résultats des incidents',
    'You do not have any incidents in this exercise.':
      "Vous n'avez aucun incident dans cet exercice.",
    'Exercise log': "Journal d'exercice",
    'You do not have any entries in the exercise log.':
      "Vous n'avez aucune entrée dans le journal de cet exercice.",
    'Outcome view': 'Vue du résultat',
    'No comment for this incident.': 'Aucun commentaire pour cet incident.',
    'Log view': "Vue de l'entrée",
  },
});

const styles = () => ({
  headtitle: {
    fontWeight: '600',
    fontSize: '18px',
  },
  headsubtitle: {
    fontSize: '15px',
  },
  title: {
    float: 'left',
    fontSize: '13px',
    textTransform: 'uppercase',
    height: '35px',
  },
  empty: {
    marginTop: 30,
    fontSize: '18px',
    fontWeight: 500,
    textAlign: 'left',
  },
  log_title: {
    float: 'left',
    padding: '5px 0px 0px 0px',
  },
  incident_result: {
    width: '140px',
    fontSize: '14px',
    marginRight: 50,
  },
  log_date: {
    position: 'absolute',
    width: '140px',
    right: '45px',
    top: '26px',
    fontSize: '14px',
  },
  log_content: {
    padding: '0px 35px 0px 0px',
    textAlign: 'justify',
  },
});

class IndexExerciseLessons extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openOutcome: false,
      currentIncident: {},
      openLog: false,
      currentLog: {},
    };
  }

  componentDidMount() {
    this.props.fetchGroups();
    this.subscription = interval$.subscribe(() => {
      this.props.fetchLogs(this.props.exerciseId, true);
      this.props.fetchIncidents(this.props.exerciseId, true);
    });
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  handleOpenOutcome(incident) {
    this.setState({ currentIncident: incident, openOutcome: true });
  }

  handleCloseOutcome() {
    this.setState({ openOutcome: false });
  }

  handleOpenLog(log) {
    this.setState({ currentLog: log, openLog: true });
  }

  handleCloseLog() {
    this.setState({ openLog: false });
  }

  render() {
    const { classes } = this.props;
    const userCanUpdate = this.props.exercise?.user_can_update;
    return (
      <div className={classes.container}>
        <Grid container={true} spacing={3}>
          <Grid item={true} xs={6}>
            <Typography variant="h5" style={{ float: 'left' }}>
              <T>Incidents outcomes</T>
            </Typography>
            <div className="clearfix" style={{ marginBottom: 3 }} />
            {this.props.incidents.length === 0 && (
              <div className={classes.empty}>
                <T>You do not have any incidents in this exercise.</T>
              </div>
            )}
            <List>
              {this.props.incidents.map((incident) => (
                <ListItem
                  key={incident.incident_id}
                  button={true}
                  divider={true}
                  onClick={this.handleOpenOutcome.bind(this, incident)}
                >
                  <ListItemIcon>
                    <LayersOutlined />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <div>
                        <div className={classes.log_title}>
                          {incident.incident_title}
                        </div>
                        <div className="clearfix" />
                      </div>
                    }
                    secondary={
                      <div className={classes.log_content}>
                        {incident.incident_outcome?.outcome_comment === null ? (
                          <i>
                            <T>No comment for this incident.</T>
                          </i>
                        ) : (
                          <i>{incident.incident_outcome?.outcome_comment}</i>
                        )}
                      </div>
                    }
                  />
                  <div className={classes.incident_result}>
                    <LinearProgress
                      variant="determinate"
                      value={incident.incident_outcome?.outcome_result}
                    />
                  </div>
                  <ListItemSecondaryAction>
                    <IncidentPopover
                      exerciseId={this.props.exerciseId}
                      incident={incident}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
            <Dialog
              open={this.state.openOutcome}
              onClose={this.handleCloseOutcome.bind(this)}
              fullWidth={true}
              maxWidth="md"
            >
              <DialogTitle>
                <T>Outcome view</T>
              </DialogTitle>
              <DialogContent>
                <OutcomeView incident={this.state.currentIncident} />
              </DialogContent>
              <DialogActions>
                <Button
                  variant="outlined"
                  onClick={this.handleCloseOutcome.bind(this)}
                >
                  <T>Close</T>
                </Button>
              </DialogActions>
            </Dialog>
          </Grid>
          <Grid item={true} xs={6}>
            <Typography variant="h5" style={{ float: 'left' }}>
              <T>Exercise log</T>
            </Typography>
            {userCanUpdate && (
              <LogsPopover exerciseId={this.props.exerciseId} />
            )}
            <div className="clearfix" />
            {this.props.logs.length === 0 && (
              <div className={classes.empty}>
                <T>You do not have any entries in the exercise log.</T>
              </div>
            )}
            <List>
              {this.props.logs.map((log) => (
                <ListItem
                  key={log.log_id}
                  onClick={this.handleOpenLog.bind(this, log)}
                  divider={true}
                  button={true}
                >
                  <ListItemIcon>
                    <DescriptionOutlined />
                  </ListItemIcon>
                  <ListItemText
                    primary={log.log_title}
                    secondary={log.log_content}
                  />
                  <div className={classes.log_date}>
                    {dateFormat(log.log_date)}
                  </div>
                  <ListItemSecondaryAction>
                    <LogPopover exerciseId={this.props.exerciseId} log={log} />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
            <Dialog
              open={this.state.openLog}
              onClose={this.handleCloseLog.bind(this)}
              fullWidth={true}
              maxWidth="md"
            >
              <DialogTitle>
                <T>Log view</T>
              </DialogTitle>
              <DialogContent>
                <LogView log={this.state.currentLog} />
              </DialogContent>
              <DialogActions>
                <Button
                  variant="outlined"
                  onClick={this.handleCloseLog.bind(this)}
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

IndexExerciseLessons.propTypes = {
  exerciseId: PropTypes.string,
  logs: PropTypes.array,
  incidents: PropTypes.array,
  fetchGroups: PropTypes.func,
  fetchLogs: PropTypes.func,
  fetchIncidents: PropTypes.func,
};

const filterLogs = (state, ownProps) => {
  const { id: exerciseId } = ownProps;
  const { logs } = state.referential.entities;
  const logsFilterAndSorting = R.pipe(
    R.values,
    R.filter((n) => n.log_exercise === exerciseId),
    R.sortWith([R.descend(R.prop('log_date'))]),
  );
  return logsFilterAndSorting(logs);
};

const filterIncidents = (state, ownProps) => {
  const { id: exerciseId } = ownProps;
  const { incidents } = state.referential.entities;
  const incidentsFilterAndSorting = R.pipe(
    R.values,
    R.filter((n) => n.incident_exercise === exerciseId),
    R.sortWith([R.ascend(R.prop('incident_order'))]),
  );
  return incidentsFilterAndSorting(incidents);
};

const exerciseStatusSelector = (state, ownProps) => {
  const { id: exerciseId } = ownProps;
  return R.path(
    [exerciseId, 'exercise_status'],
    state.referential.entities.exercises,
  );
};

const select = () => equalsSelector({
  // Prevent view to refresh is nothing as changed (Using reselect)
  exerciseId: (state, ownProps) => ownProps.id,
  exercise: (state, ownProps) => state.referential.entities.exercises[ownProps.id],
  logs: filterLogs,
  incidents: filterIncidents,
  exercise_status: exerciseStatusSelector,
});

export default R.compose(
  connect(select, {
    fetchGroups,
    fetchLogs,
    fetchIncidents,
  }),
  withStyles(styles),
)(IndexExerciseLessons);
