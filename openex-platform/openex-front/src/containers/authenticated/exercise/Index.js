import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import { injectIntl } from 'react-intl';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import {
  EmailOutlined,
  InputOutlined,
  SmsOutlined,
  CenterFocusStrongOutlined,
  KeyboardArrowDownOutlined,
  GroupOutlined,
  ExpandLess,
  ExpandMore,
  LayersOutlined,
  EventOutlined,
} from '@material-ui/icons';
import Collapse from '@material-ui/core/Collapse';
import { T } from '../../../components/I18n';
import { i18nRegister } from '../../../utils/Messages';
import { dateFormat, timeDiff } from '../../../utils/Time';
import { fetchObjectives } from '../../../actions/Objective';
import { fetchSubobjectives } from '../../../actions/Subobjective';
import { fetchAudiences } from '../../../actions/Audience';
import { fetchSubaudiences } from '../../../actions/Subaudience';
import { fetchEvents } from '../../../actions/Event';
import { fetchIncidents, fetchIncidentTypes } from '../../../actions/Incident';
import { downloadFile } from '../../../actions/File';
import { fetchAllInjects } from '../../../actions/Inject';
import { fetchExercise } from '../../../actions/Exercise';
import { fetchGroups } from '../../../actions/Group';
import InjectView from './scenario/event/InjectView';
import AudienceView from './audiences/audience/AudienceView';
import ObjectiveView from './objective/ObjectiveView';
import AudiencePopover from './AudiencePopover';
import AudiencesPopover from './AudiencesPopover';
import ScenarioPopover from './ScenarioPopover';

i18nRegister({
  fr: {
    'Main objectives': 'Objectifs principaux',
    Audiences: 'Audiences',
    players: 'joueurs',
    'You do not have any objectives in this exercise.':
      "Vous n'avez aucun objectif dans cet exercice.",
    'You do not have any audiences in this exercise.':
      "Vous n'avez aucune audience dans cet exercice.",
    Scenario: 'Scénario',
    'You do not have any events in this exercise.':
      "Vous n'avez aucun événement dans cet exercice.",
    'Inject view': "Vue de l'injection",
    'Incident view': "Vue de l'incident",
    'Objective view': "Vue de l'objectif",
    'Audience view': "Vue de l'audience",
    'Event view': "Vue de l'événement",
    'View all': 'Voir tout',
    'Audiences of the inject': "Audiences de l'injection",
  },
});

const styles = (theme) => ({
  empty: {
    marginTop: 15,
    fontSize: 16,
  },
  nested: {
    paddingLeft: theme.spacing(4),
  },
  nested2: {
    paddingLeft: theme.spacing(8),
  },
});

class IndexExercise extends Component {
  constructor(props) {
    super(props);
    this.state = {
      eventsOpened: {},
      incidentsOpened: {},
      openViewInject: false,
      currentInject: {},
      openViewAudience: false,
      currentAudience: {},
      openViewObjective: false,
      currentObjective: {},
      openObjectives: false,
      openAudiences: false,
      currentInjectAudiences: [],
      openInjectAudiences: false,
    };
  }

  componentDidMount() {
    this.props.fetchIncidentTypes();
    this.props.fetchGroups();
    this.props.fetchObjectives(this.props.exerciseId);
    this.props.fetchSubobjectives(this.props.exerciseId);
    this.props.fetchAudiences(this.props.exerciseId);
    this.props.fetchSubaudiences(this.props.exerciseId);
    this.props.fetchEvents(this.props.exerciseId);
    this.props.fetchIncidents(this.props.exerciseId);
    this.props.fetchAllInjects(this.props.exerciseId);
    this.props.fetchExercise(this.props.exerciseId);
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

  handleToggleEvent(eventId) {
    const { eventsOpened } = this.state;
    eventsOpened[eventId] = eventsOpened[eventId] !== null ? !eventsOpened[eventId] : true;
    this.setState({ eventsOpened });
  }

  handleCloseViewEvent() {
    this.setState({ openViewEvent: false });
  }

  handleToggleIncident(incidentId) {
    const { incidentsOpened } = this.state;
    incidentsOpened[incidentId] = incidentsOpened[incidentId] !== null
      ? !incidentsOpened[incidentId]
      : true;
    this.setState({ incidentsOpened });
  }

  handleOpenViewInject(inject) {
    this.setState({ currentInject: inject, openViewInject: true });
  }

  handleCloseViewInject() {
    this.setState({ openViewInject: false });
  }

  handleOpenViewAudience(audience) {
    this.setState({ currentAudience: audience, openViewAudience: true });
  }

  handleCloseViewAudience() {
    this.setState({ openViewAudience: false });
  }

  handleOpenViewObjective(objective) {
    this.setState({ currentObjective: objective, openViewObjective: true });
  }

  handleCloseViewObjective() {
    this.setState({ openViewObjective: false });
  }

  handleOpenObjectives() {
    this.setState({ openObjectives: true });
  }

  handleCloseObjectives() {
    this.setState({ openObjectives: false });
  }

  handleOpenAudiences() {
    this.setState({ openAudiences: true });
  }

  handleCloseAudiences() {
    this.setState({ openAudiences: false });
  }

  handleOpenInjectAudiences(audiences, event) {
    event.stopPropagation();
    this.setState({
      currentInjectAudiences: audiences,
      openInjectAudiences: true,
    });
  }

  handleCloseInjectAudiences() {
    this.setState({ openInjectAudiences: false });
  }

  downloadAttachment(fileId, fileName) {
    return this.props.downloadFile(fileId, fileName);
  }

  render() {
    const { classes } = this.props;
    return (
      <div>
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <Typography variant="h5" style={{ float: 'left' }}>
              <T>Main objectives</T>
            </Typography>
            <div className="clearfix" style={{ marginBottom: 8 }} />
            {this.props.objectives.length === 0 && (
              <div className={classes.empty}>
                <T>You do not have any objectives in this exercise.</T>
              </div>
            )}
            <List>
              {R.take(3, this.props.objectives).map((objective) => (
                <ListItem
                  key={objective.objective_id}
                  divider={true}
                  button={true}
                  onClick={this.handleOpenViewObjective.bind(this, objective)}
                >
                  <ListItemIcon>
                    <CenterFocusStrongOutlined />
                  </ListItemIcon>
                  <ListItemText
                    primary={objective.objective_title}
                    secondary={objective.objective_description}
                  />
                </ListItem>
              ))}
            </List>
            {this.props.objectives.length > 3 && (
              <div
                onClick={this.handleOpenObjectives.bind(this)}
                className={classes.expand}
              >
                <KeyboardArrowDownOutlined />
              </div>
            )}
            <Dialog
              open={this.state.openObjectives}
              onClose={this.handleCloseObjectives.bind(this)}
              maxWidth="md"
              fullWidth={true}
            >
              <DialogTitle>
                <T>Main objectives</T>
              </DialogTitle>
              <DialogContent>
                <List>
                  {this.props.objectives.map((objective) => (
                    <ListItem
                      key={objective.objective_id}
                      divider={true}
                      button={true}
                      onClick={this.handleOpenViewObjective.bind(
                        this,
                        objective,
                      )}
                    >
                      <ListItemIcon>
                        <CenterFocusStrongOutlined />
                      </ListItemIcon>
                      <ListItemText
                        primary={objective.objective_title}
                        secondar={objective.objective_description}
                      />
                    </ListItem>
                  ))}
                </List>
                <DialogActions>
                  <Button
                    variant="outlined"
                    onClick={this.handleCloseObjectives.bind(this)}
                  >
                    <T>Close</T>
                  </Button>
                </DialogActions>
              </DialogContent>
            </Dialog>
            <Dialog
              open={this.state.openViewObjective}
              onClose={this.handleCloseViewObjective.bind(this)}
              maxWidth="md"
              fullWidth={true}
            >
              <DialogTitle>
                {R.propOr('-', 'objective_title', this.state.currentObjective)}
              </DialogTitle>
              <DialogContent>
                <ObjectiveView objective={this.state.currentObjective} />
              </DialogContent>
              <DialogActions>
                <Button
                  variant="outlined"
                  onClick={this.handleCloseViewObjective.bind(this)}
                >
                  <T>Close</T>
                </Button>
              </DialogActions>
            </Dialog>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="h5" style={{ float: 'left' }}>
              Audiences
            </Typography>
            <AudiencesPopover exerciseId={this.props.exerciseId} />
            <div className="clearfix" />
            {this.props.audiences.length === 0 && (
              <div className={classes.empty}>
                <T>You do not have any audiences in this exercise.</T>
              </div>
            )}
            <List>
              {R.take(3, this.props.audiences).map((audience) => {
                const playersText = `${
                  audience.audience_users_number
                } ${this.props.intl.formatMessage({ id: 'players' })}`;
                return (
                  <ListItem
                    key={audience.audience_id}
                    onClick={this.handleOpenViewAudience.bind(this, audience)}
                    button={true}
                    divider={true}
                  >
                    <ListItemIcon>
                      <GroupOutlined />
                    </ListItemIcon>
                    <ListItemText
                      primary={audience.audience_name}
                      secondary={playersText}
                    />
                    <ListItemSecondaryAction>
                      <AudiencePopover
                        exerciseId={this.props.exerciseId}
                        audience={audience}
                      />
                    </ListItemSecondaryAction>
                  </ListItem>
                );
              })}
            </List>
            {this.props.audiences.length > 3 && (
              <div
                onClick={this.handleOpenAudiences.bind(this)}
                className={classes.expand}
              >
                <KeyboardArrowDownOutlined />
              </div>
            )}
            <Dialog
              open={this.state.openAudiences}
              onClose={this.handleCloseAudiences.bind(this)}
              maxWidth="md"
              fullWidth={true}
            >
              <DialogTitle>
                <T>Audiences</T>
              </DialogTitle>
              <DialogContent>
                <List>
                  {this.props.audiences.map((audience) => {
                    const playersText = `${
                      audience.audience_users_number
                    } ${this.props.intl.formatMessage({ id: 'players' })}`;
                    return (
                      <ListItem
                        key={audience.audience_id}
                        button={true}
                        divider={true}
                        onClick={this.handleOpenViewAudience.bind(
                          this,
                          audience,
                        )}
                      >
                        <ListItemIcon>
                          <GroupOutlined />
                        </ListItemIcon>
                        <ListItemText
                          primary={audience.audience_name}
                          secondary={playersText}
                        />
                        <ListItemSecondaryAction>
                          <AudiencePopover
                            exerciseId={this.props.exerciseId}
                            audience={audience}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    );
                  })}
                </List>
              </DialogContent>
              <DialogActions>
                <Button
                  variant="outlined"
                  onClick={this.handleCloseAudiences.bind(this)}
                >
                  <T>Close</T>
                </Button>
              </DialogActions>
            </Dialog>
            <Dialog
              open={this.state.openViewAudience}
              onClose={this.handleCloseViewAudience.bind(this)}
              maxWidth="md"
              fullWidth={true}
            >
              <DialogTitle>
                {R.propOr('-', 'audience_name', this.state.currentAudience)}
              </DialogTitle>
              <DialogContent>
                <AudienceView
                  audience={this.state.currentAudience}
                  subaudiences={this.props.subaudiences}
                />
              </DialogContent>
              <DialogActions>
                <Button
                  variant="outlined"
                  onClick={this.handleCloseViewAudience.bind(this)}
                >
                  <T>Close</T>
                </Button>
              </DialogActions>
            </Dialog>
          </Grid>
        </Grid>
        <br />
        <Typography variant="h5" style={{ float: 'left' }}>
          <T>Scenario</T>
        </Typography>
        <ScenarioPopover
          exerciseId={this.props.exerciseId}
          injects={this.props.injects}
          exercise={this.props.exercise}
          exerciseStartDate={this.props.exerciseStartDate}
          exerciseEndDate={this.props.exerciseEndDate}
          userCanUpdate={this.props.userCanUpdate}
        />
        <div className="clearfix" />
        {this.props.events.length === 0 && (
          <div className={classes.empty}>
            <T>You do not have any events in this exercise.</T>
          </div>
        )}
        <List>
          {this.props.events.map((event) => {
            const incidents = R.pipe(
              R.map((data) => R.pathOr(
                { incident_title: '' },
                ['incidents', data.incident_id],
                this.props,
              )),
              R.sort((a, b) => a.incident_order > b.incident_order),
            )(event.event_incidents);
            const nestedItems = incidents.map((incident) => {
              const incidentId = R.propOr(
                Math.random(),
                'incident_id',
                incident,
              );
              const incidentTitle = R.propOr('-', 'incident_title', incident);
              const incidentStory = R.propOr('-', 'incident_story', incident);
              const incidentInjects = R.propOr(
                [],
                'incident_injects',
                incident,
              );
              const injects = R.pipe(
                R.map((data) => R.pathOr({}, ['injects', data.inject_id], this.props)),
                R.sort((a, b) => timeDiff(a.inject_date, b.inject_date)),
              )(incidentInjects);
              const nestedItems2 = injects.map((inject) => {
                const injectId = R.propOr(Math.random(), 'inject_id', inject);
                const injectTitle = R.propOr('-', 'inject_title', inject);
                const injectType = R.propOr('-', 'inject_type', inject);
                const injectDate = R.propOr(undefined, 'inject_date', inject);
                return (
                  <ListItem
                    key={injectId}
                    button={true}
                    divider={true}
                    onClick={this.handleOpenViewInject.bind(this, inject)}
                    className={classes.nested2}
                  >
                    <ListItemIcon>{this.selectIcon(injectType)}</ListItemIcon>
                    <ListItemText
                      primary={injectTitle}
                      secondary={dateFormat(injectDate)}
                    />
                  </ListItem>
                );
              });
              return (
                <div key={incidentId}>
                  <ListItem
                    divider={true}
                    button={true}
                    onClick={this.handleToggleIncident.bind(
                      this,
                      incident.incident_id,
                    )}
                    className={classes.nested}
                  >
                    <ListItemIcon>
                      <LayersOutlined />
                    </ListItemIcon>
                    <ListItemText
                      primary={incidentTitle}
                      secondary={incidentStory}
                    />
                    {this.state.incidentsOpened[incident.incident_id]
                    === true ? (
                      <ExpandLess />
                      ) : (
                      <ExpandMore />
                      )}
                  </ListItem>
                  <Collapse
                    in={
                      this.state.incidentsOpened[incident.incident_id] === true
                    }
                  >
                    <List>{nestedItems2}</List>
                  </Collapse>
                </div>
              );
            });
            return (
              <div key={event.event_id}>
                <ListItem
                  divider={true}
                  button={true}
                  onClick={this.handleToggleEvent.bind(this, event.event_id)}
                >
                  <ListItemIcon>
                    <EventOutlined />
                  </ListItemIcon>
                  <ListItemText
                    primary={event.event_title}
                    secondary={event.event_description}
                  />
                  {this.state.eventsOpened[event.event_id] === true ? (
                    <ExpandLess />
                  ) : (
                    <ExpandMore />
                  )}
                </ListItem>
                <Collapse in={this.state.eventsOpened[event.event_id] === true}>
                  <List>{nestedItems}</List>
                </Collapse>
              </div>
            );
          })}
        </List>
        <Dialog
          open={this.state.openViewInject}
          onClose={this.handleCloseViewInject.bind(this)}
          maxWidth="md"
          fullWidth={true}
        >
          <DialogTitle>
            {R.propOr('-', 'inject_title', this.state.currentInject)}
          </DialogTitle>
          <DialogContent>
            <InjectView
              downloadAttachment={this.downloadAttachment.bind(this)}
              inject={this.state.currentInject}
              audiences={this.props.audiences}
              subaudiences={R.values(this.props.subaudiences)}
            />
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              onClick={this.handleCloseViewInject.bind(this)}
            >
              <T>Close</T>
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={this.state.openInjectAudiences}
          onClose={this.handleCloseInjectAudiences.bind(this)}
          maxWidth="md"
          fullWidth={true}
        >
          <DialogTitle>
            <t>Audiences of the inject</t>
          </DialogTitle>
          <DialogContent>
            <List>
              {this.state.currentInjectAudiences.map((data) => {
                const audience = R.find(
                  (a) => a.audience_id === data.audience_id,
                )(this.props.audiences);
                const audienceId = R.propOr(
                  data.audience_id,
                  'audience_id',
                  audience,
                );
                const audienceName = R.propOr('-', 'audience_name', audience);
                const audienceUsers = R.propOr([], 'audience_users', audience);
                const playersText = `${
                  audienceUsers.length
                } ${this.props.intl.formatMessage({ id: 'players' })}`;
                return (
                  <ListItem
                    key={audienceId}
                    onClick={this.handleOpenViewAudience.bind(this, audience)}
                    button={true}
                    divider={true}
                  >
                    <ListItemIcon>
                      <GroupOutlined />
                    </ListItemIcon>
                    <ListItemText
                      primary={audienceName}
                      secondary={playersText}
                    />
                  </ListItem>
                );
              })}
            </List>
          </DialogContent>
          <DialogActions>
            <Button
              variant="outlined"
              onClick={this.handleCloseInjectAudiences.bind(this)}
            >
              <T>Close</T>
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

IndexExercise.propTypes = {
  exerciseId: PropTypes.string,
  objectives: PropTypes.array,
  subobjectives: PropTypes.object,
  audiences: PropTypes.array,
  subaudiences: PropTypes.object,
  events: PropTypes.array,
  incidents: PropTypes.object,
  incident_types: PropTypes.object,
  injects: PropTypes.object,
  exercise: PropTypes.object,
  fetchGroups: PropTypes.func,
  fetchObjectives: PropTypes.func,
  fetchSubobjectives: PropTypes.func,
  fetchAudiences: PropTypes.func,
  fetchSubaudiences: PropTypes.func,
  fetchEvents: PropTypes.func,
  fetchIncidents: PropTypes.func,
  fetchAllInjects: PropTypes.func,
  fetchExercise: PropTypes.func,
  fetchIncidentTypes: PropTypes.func,
  intl: PropTypes.object,
  downloadFile: PropTypes.func,
};

const filterObjectives = (objectives, exerciseId) => {
  const objectivesFilterAndSorting = R.pipe(
    R.values,
    R.filter((n) => n.objective_exercise.exercise_id === exerciseId),
    R.sort((a, b) => a.objective_priority > b.objective_priority),
  );
  return objectivesFilterAndSorting(objectives);
};

const filterAudiences = (audiences, exerciseId) => {
  const audiencesFilterAndSorting = R.pipe(
    R.values,
    R.filter((n) => n.audience_exercise.exercise_id === exerciseId),
    R.sort((a, b) => a.audience_name.localeCompare(b.audience_name)),
  );
  return audiencesFilterAndSorting(audiences);
};

const filterEvents = (events, exerciseId) => {
  const eventsFilterAndSorting = R.pipe(
    R.values,
    R.filter((n) => n.event_exercise.exercise_id === exerciseId),
    R.sort((a, b) => a.event_order > b.event_order),
  );
  return eventsFilterAndSorting(events);
};

const getExerciseStartDate = (exercises) => {
  const exercise = R.pipe(R.values)(exercises);
  if (exercise.length > 0) {
    return exercise[0].exercise_start_date;
  }
  return null;
};

const getExerciseEndDate = (exercises) => {
  const exercise = R.pipe(R.values)(exercises);
  if (exercise.length > 0) {
    return exercise[0].exercise_end_date;
  }
  return null;
};

const select = (state, ownProps) => {
  const { id: exerciseId } = ownProps;
  const objectives = filterObjectives(
    state.referential.entities.objectives,
    exerciseId,
  );
  const audiences = filterAudiences(
    state.referential.entities.audiences,
    exerciseId,
  );
  const events = filterEvents(state.referential.entities.events, exerciseId);
  const exerciseStartDate = getExerciseStartDate(
    state.referential.entities.exercises,
  );
  const exerciseEndDate = getExerciseEndDate(
    state.referential.entities.exercises,
  );
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

  return {
    exerciseId,
    userCanUpdate,
    objectives,
    subobjectives: state.referential.entities.subobjectives,
    audiences,
    subaudiences: state.referential.entities.subaudiences,
    events,
    incidents: state.referential.entities.incidents,
    incident_types: state.referential.entities.incident_types,
    injects: state.referential.entities.injects,
    exercise: state.referential.entities.exercises,
    exerciseStartDate,
    exerciseEndDate,
  };
};

export default R.compose(
  connect(select, {
    fetchObjectives,
    fetchSubobjectives,
    fetchAudiences,
    fetchSubaudiences,
    fetchEvents,
    fetchIncidents,
    fetchIncidentTypes,
    fetchAllInjects,
    fetchExercise,
    fetchGroups,
    downloadFile,
  }),
  withStyles(styles),
)(injectIntl(IndexExercise));
