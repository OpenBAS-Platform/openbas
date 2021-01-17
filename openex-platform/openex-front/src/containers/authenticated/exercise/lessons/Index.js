import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { interval } from 'rxjs';
import Dialog from '@material-ui/core/Dialog';
import Button from '@material-ui/core/Button';
import { dateFormat, FIVE_SECONDS } from '../../../../utils/Time';
import { T } from '../../../../components/I18n';
import { i18nRegister } from '../../../../utils/Messages';
import * as Constants from '../../../../constants/ComponentTypes';
import { List } from '../../../../components/List';
import { MainListItem } from '../../../../components/list/ListItem';
import { Icon } from '../../../../components/Icon';
import { LinearProgress } from '../../../../components/LinearProgress';
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

const styles = {
  container: {
    textAlign: 'center',
  },
  columnLeft: {
    float: 'left',
    width: '48%',
    margin: 0,
    padding: 0,
    textAlign: 'left',
  },
  columnRight: {
    float: 'right',
    width: '48%',
    margin: 0,
    padding: 0,
    textAlign: 'left',
  },
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
    position: 'absolute',
    width: '140px',
    right: '45px',
    top: '30px',
    fontSize: '14px',
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
};

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
    const outcomeActions = [
      <Button
        key="close"
        label="Close"
        primary={true}
        onClick={this.handleCloseOutcome.bind(this)}
      />,
    ];
    const logActions = [
      <Button
        key="close"
        label="Close"
        primary={true}
        onClick={this.handleCloseLog.bind(this)}
      />,
    ];

    return (
      <div style={styles.container}>
        <div style={styles.columnLeft}>
          <div style={styles.title}>
            <T>Incidents outcomes</T>
          </div>
          <div className="clearfix"/>
          {this.props.incidents.length === 0 ? (
            <div style={styles.empty}>
              <T>You do not have any incidents in this exercise.</T>
            </div>
          ) : (
            ''
          )}
          <List>
            {this.props.incidents.map((incident) => (
              <MainListItem
                key={incident.incident_id}
                onClick={this.handleOpenOutcome.bind(this, incident)}
                rightIconButton={
                  <IncidentPopover
                    exerciseId={this.props.exerciseId}
                    incident={incident}
                  />
                }
                primaryText={
                  <div>
                    <div style={styles.log_title}>
                      {incident.incident_title}
                    </div>
                    <div style={styles.incident_result}>
                      <LinearProgress
                        mode="determinate"
                        min={0}
                        max={100}
                        value={incident.incident_outcome.outcome_result}
                      />
                    </div>
                    <div className="clearfix"/>
                  </div>
                }
                secondaryText={
                  <div style={styles.log_content}>
                    {incident.incident_outcome.outcome_comment === null ? (
                      <i>
                        <T>No comment for this incident.</T>
                      </i>
                    ) : (
                      <i>{incident.incident_outcome.outcome_comment}</i>
                    )}
                  </div>
                }
                leftIcon={
                  <Icon
                    name={Constants.ICON_NAME_MAPS_LAYERS}
                    type={Constants.ICON_TYPE_MAINLIST2}
                  />
                }
              />
            ))}
          </List>
          <Dialog
            title="Outcome view"
            modal={false}
            open={this.state.openOutcome}
            autoScrollBodyContent={true}
            onClose={this.handleCloseOutcome.bind(this)}
            actions={outcomeActions}
          >
            <OutcomeView incident={this.state.currentIncident} />
          </Dialog>
        </div>
        <div style={styles.columnRight}>
          <div style={styles.title}>
            <T>Exercise log</T>
          </div>
          {this.props.userCanUpdate ? (
            <LogsPopover exerciseId={this.props.exerciseId} />
          ) : (
            ''
          )}
          <div className="clearfix" />
          {this.props.logs.length === 0 ? (
            <div style={styles.empty}>
              <T>You do not have any entries in the exercise log.</T>
            </div>
          ) : (
            ''
          )}
          <List>
            {this.props.logs.map((log) => (
              <MainListItem
                key={log.log_id}
                onClick={this.handleOpenLog.bind(this, log)}
                rightIconButton={
                  <LogPopover exerciseId={this.props.exerciseId} log={log} />
                }
                primaryText={
                  <div>
                    <div style={styles.log_title}>{log.log_title}</div>
                    <div style={styles.log_date}>
                      {dateFormat(log.log_date)}
                    </div>
                    <div className="clearfix" />
                  </div>
                }
                secondaryText={
                  <div style={styles.log_content}>{log.log_content}</div>
                }
                leftIcon={
                  <Icon
                    name={Constants.ICON_NAME_ACTION_DESCRIPTION}
                    type={Constants.ICON_TYPE_MAINLIST2}
                  />
                }
              />
            ))}
          </List>
          <Dialog
            title="Log view"
            modal={false}
            open={this.state.openLog}
            autoScrollBodyContent={true}
            onClose={this.handleCloseLog.bind(this)}
            actions={logActions}
          >
            <LogView log={this.state.currentLog} />
          </Dialog>
        </div>
      </div>
    );
  }
}

IndexExerciseLessons.propTypes = {
  exerciseId: PropTypes.string,
  logs: PropTypes.array,
  incidents: PropTypes.array,
  userCanUpdate: PropTypes.bool,
  fetchGroups: PropTypes.func,
  fetchLogs: PropTypes.func,
  fetchIncidents: PropTypes.func,
};

const filterLogs = (state, ownProps) => {
  const { id: exerciseId } = ownProps;
  const { logs } = state.referential.entities;
  const logsFilterAndSorting = R.pipe(
    R.values,
    R.filter((n) => n.log_exercise.exercise_id === exerciseId),
    R.sort((a, b) => a.log_date < b.log_date),
  );
  return logsFilterAndSorting(logs);
};

const filterIncidents = (state, ownProps) => {
  const { id: exerciseId } = ownProps;
  const { incidents } = state.referential.entities;
  const incidentsFilterAndSorting = R.pipe(
    R.values,
    R.filter((n) => n.incident_exercise === exerciseId),
    R.sort((a, b) => a.incident_title.localeCompare(b.incident_title)),
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

const checkUserCanUpdate = (state, ownProps) => {
  const { id: exerciseId } = ownProps;
  const userId = R.path(['logged', 'user'], state.app);
  let userCanUpdate = R.path(
    [userId, 'user_admin'],
    state.referential.entities.users,
  );
  if (!userCanUpdate) {
    const groupValues = R.values(state.referential.entities.groups);
    groupValues.forEach((group) => {
      group.group_grants.forEach((grant) => {
        if (
          grant
          && grant.grant_exercise
          && grant.grant_exercise.exercise_id === exerciseId
          && grant.grant_name === 'PLANNER'
        ) {
          group.group_users.forEach((user) => {
            if (user && user.user_id === userId) {
              userCanUpdate = true;
            }
          });
        }
      });
    });
  }

  return userCanUpdate;
};

const select = () => equalsSelector({
  // Prevent view to refresh is nothing as changed (Using reselect)
  exerciseId: (state, ownProps) => ownProps.exerciseId,
  logs: filterLogs,
  userCanUpdate: checkUserCanUpdate,
  incidents: filterIncidents,
  exercise_status: exerciseStatusSelector,
});

export default connect(select, {
  fetchGroups,
  fetchLogs,
  fetchIncidents,
})(IndexExerciseLessons);
