import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import * as R from 'ramda';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import { withStyles } from '@material-ui/core/styles';
import {
  EventOutlined,
  EmailOutlined,
  SmsOutlined,
  InputOutlined,
} from '@material-ui/icons';
import Typography from '@material-ui/core/Typography';
import { green, red } from '@material-ui/core/colors';
import { dateFormat } from '../../../../../utils/Time';
import { i18nRegister } from '../../../../../utils/Messages';
import { T } from '../../../../../components/I18n';
import { SearchField } from '../../../../../components/SearchField';
import { fetchAudiences } from '../../../../../actions/Audience';
import { fetchSubaudiences } from '../../../../../actions/Subaudience';
import { fetchSubobjectives } from '../../../../../actions/Subobjective';
import { downloadFile } from '../../../../../actions/File';
import { fetchEvents } from '../../../../../actions/Event';
import {
  fetchIncidents,
  fetchIncidentTypes,
} from '../../../../../actions/Incident';
import {
  fetchInjects,
  fetchInjectTypes,
  fetchInjectTypesExerciseSimple,
} from '../../../../../actions/Inject';
import { fetchGroups } from '../../../../../actions/Group';
import * as Constants from '../../../../../constants/ComponentTypes';
import IncidentNav from './IncidentNav';
import EventPopover from './EventPopover';
import CreateInject from './CreateInject';
import InjectPopover from './InjectPopover';
import InjectView from './InjectView';

i18nRegister({
  fr: {
    'This event is empty.': 'Cet événement est vide.',
    'This incident is empty.': 'Cet incident est vide.',
    Title: 'Titre',
    Date: 'Date',
    Author: 'Auteur',
    'linked subobjective(s)': 'sous-objectif(s) lié(s)',
  },
});

const styles = () => ({
  container: {
    paddingRight: '300px',
  },
  toolbar: {
    position: 'fixed',
    top: 0,
    right: 320,
    zIndex: '5000',
    backgroundColor: 'none',
  },
  title: {
    float: 'left',
    fontSize: '13px',
    textTransform: 'uppercase',
  },
  subobjectives: {
    float: 'left',
    fontSize: '12px',
  },
  empty: {
    marginTop: 30,
    fontSize: '18px',
    fontWeight: 500,
    textAlign: 'center',
  },
  search: {
    float: 'right',
  },
  inject_date: {
    float: 'left',
    width: '30%',
    padding: '5px 0 0 0',
  },
  inject_user: {
    width: '40%',
    float: 'left',
    padding: '5px 0 0 0',
  },
  inject_audiences: {
    float: 'left',
    padding: '5px 0 0 0',
    fontWeight: 600,
  },
  enabled: {
    color: green[500],
  },
  disabled: {
    color: red[500],
  },
});

class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sortBy: 'inject_date',
      orderAsc: true,
      searchTerm: '',
      openView: false,
      currentInject: {},
    };
  }

  componentDidMount() {
    this.props.fetchSubobjectives(this.props.exerciseId);
    this.props.fetchAudiences(this.props.exerciseId);
    this.props.fetchSubaudiences(this.props.exerciseId);
    this.props.fetchEvents(this.props.exerciseId);
    this.props.fetchIncidentTypes();
    this.props.fetchIncidents(this.props.exerciseId);
    // eslint-disable-next-line consistent-return
    this.props.fetchInjectTypes().then((value) => {
      if (value.result.length !== 0) {
        // Build object from array
        const injectTypes = {};
        value.result.map((type) => {
          injectTypes[type] = {
            type,
          };
          return true;
        });
        return {
          inject_types: injectTypes,
        };
      }
    });
    this.props.fetchInjects(this.props.exerciseId, this.props.eventId);
    this.props.fetchGroups();
  }

  reloadEvent() {
    this.props.fetchIncidents(this.props.exerciseId);
    this.props.fetchInjects(this.props.exerciseId, this.props.eventId);
  }

  handleSearchInjects(event) {
    this.setState({ searchTerm: event.target.value });
  }

  // TODO replace with sortWith after Ramdajs new release
  // eslint-disable-next-line class-methods-use-this
  ascend(a, b) {
    // eslint-disable-next-line no-nested-ternary
    return a < b ? -1 : a > b ? 1 : 0;
  }

  // eslint-disable-next-line class-methods-use-this
  descend(a, b) {
    // eslint-disable-next-line no-nested-ternary
    return a > b ? -1 : a < b ? 1 : 0;
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

  handleOpenView(inject) {
    this.setState({ currentInject: inject, openView: true });
  }

  handleCloseView() {
    this.setState({ openView: false });
  }

  downloadAttachment(fileId, fileName) {
    return this.props.downloadFile(fileId, fileName);
  }

  renderIncident() {
    const {
      classes, exerciseId, eventId, incident,
    } = this.props;
    const keyword = this.state.searchTerm;
    const filterByKeyword = (n) => keyword === ''
      || n.inject_title.toLowerCase().indexOf(keyword.toLowerCase()) !== -1
      || n.inject_description.toLowerCase().indexOf(keyword.toLowerCase())
        !== -1
      || n.inject_content.toLowerCase().indexOf(keyword.toLowerCase()) !== -1;
    const injects = R.pipe(
      R.map((data) => R.pathOr({}, ['injects', data.inject_id], this.props)),
      R.filter(filterByKeyword),
      R.sortWith([R.ascend(R.prop('inject_date'))]),
    )(incident.incident_injects);
    const eventIsUpdatable = R.propOr(
      true,
      'user_can_update',
      this.props.event,
    );
    return (
      <div>
        {incident.incident_injects.length === 0 && (
          <div className={classes.empty}>
            <T>This incident is empty.</T>
          </div>
        )}
        <List>
          {injects.map((inject) => {
            // Setup variables
            const injectId = R.propOr(Math.random(), 'inject_id', inject);
            const injectTitle = R.propOr('-', 'inject_title', inject);
            const injectDescription = R.propOr(
              '-',
              'inject_description',
              inject,
            );
            const injectUser = R.propOr('-', 'inject_user', inject);
            const injectDate = R.prop('inject_date', inject);
            const injectType = R.propOr('-', 'inject_type', inject);
            const injectAudiences = R.propOr([], 'inject_audiences', inject);
            const injectSubaudiences = R.propOr(
              [],
              'inject_subaudiences',
              inject,
            );
            const injectUsersNumber = R.propOr(
              '-',
              'inject_users_number',
              inject,
            );
            const injectEnabled = R.propOr(true, 'inject_enabled', inject);
            const injectTypeInHere = R.propOr(
              false,
              injectType,
              this.props.inject_types,
            );
            const injectDisabled = !injectTypeInHere;
            // Return the dom
            return (
              <ListItem
                key={injectId}
                onClick={this.handleOpenView.bind(this, inject)}
                button={true}
                divider={true}
              >
                <ListItemIcon
                  className={
                    !injectEnabled || injectDisabled
                      ? classes.disabled
                      : classes.enabled
                  }
                >
                  {this.selectIcon(injectType)}
                </ListItemIcon>
                <ListItemText
                  primary={injectTitle}
                  secondary={injectDescription}
                />
                <div style={{ width: 500 }}>
                  <div className={classes.inject_date}>
                    {dateFormat(injectDate)}
                  </div>
                  <div className={classes.inject_user}>{injectUser}</div>
                  <div className={classes.inject_audiences}>
                    {injectUsersNumber.toString()} <T>players</T>
                  </div>
                  <div className="clearfix" />
                </div>
                <ListItemSecondaryAction>
                  <InjectPopover
                    type={Constants.INJECT_SCENARIO}
                    exerciseId={exerciseId}
                    eventId={eventId}
                    incidentId={incident.incident_id}
                    inject={inject}
                    injectAudiencesIds={injectAudiences.map(
                      (a) => a.audience_id,
                    )}
                    injectSubaudiencesIds={injectSubaudiences.map(
                      (a) => a.subaudience_id,
                    )}
                    audiences={this.props.audiences}
                    subaudiences={this.props.subaudiences}
                    inject_types={this.props.inject_types}
                    incidents={this.props.allIncidents}
                    userCanUpdate={this.props.userCanUpdate}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            );
          })}
        </List>
        <Dialog
          open={this.state.openView}
          onClose={this.handleCloseView.bind(this)}
          fullWidth={true}
          maxWidth="md"
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
            <DialogActions>
              <Button
                variant="outlined"
                onClick={this.handleCloseView.bind(this)}
              >
                <T>Close</T>
              </Button>
            </DialogActions>
          </DialogActions>
        </Dialog>
        {eventIsUpdatable && this.props.userCanUpdate && (
          <CreateInject
            exerciseId={exerciseId}
            eventId={eventId}
            incidentId={incident.incident_id}
            inject_types={this.props.inject_types}
            audiences={this.props.audiences}
            subaudiences={this.props.subaudiences}
          />
        )}
      </div>
    );
  }

  render() {
    const {
      classes,
      exerciseId,
      eventId,
      event,
      incident,
      incidents,
    } = this.props;
    const eventIsUpdatable = R.propOr(
      true,
      'user_can_update',
      this.props.event,
    );
    if (event) {
      return (
        <div className={classes.container}>
          <IncidentNav
            exerciseId={exerciseId}
            eventId={eventId}
            incidents={incidents}
            incident_types={this.props.incident_types}
            can_create={eventIsUpdatable && this.props.userCanUpdate}
            selectedIncident={R.propOr(null, 'incident_id', incident)}
            subobjectives={this.props.subobjectives}
          />
          <div style={{ float: 'left', display: 'flex' }}>
            <EventOutlined fontSize="large" style={{ marginRight: 10 }} />
            <Typography variant="h5" style={{ float: 'left' }}>
              {event.event_title}
            </Typography>
          </div>
          <EventPopover
            exerciseId={exerciseId}
            eventId={eventId}
            event={event}
            reloadEvent={this.reloadEvent.bind(this)}
            userCanUpdate={this.props.userCanUpdate}
          />
          <div className={classes.search}>
            <SearchField onChange={this.handleSearchInjects.bind(this)} />
          </div>
          <div className="clearfix" />
          {incident ? (
            this.renderIncident()
          ) : (
            <div className={classes.empty}>
              <T>This event is empty.</T>
            </div>
          )}
        </div>
      );
    }
    return <div className={classes.container}> &nbsp; </div>;
  }
}

Index.propTypes = {
  exerciseId: PropTypes.string,
  audiences: PropTypes.array,
  subaudiences: PropTypes.array,
  eventId: PropTypes.string,
  event: PropTypes.object,
  incident_types: PropTypes.object,
  incident: PropTypes.object,
  incidents: PropTypes.array,
  inject_types: PropTypes.object,
  injects: PropTypes.object,
  subobjectives: PropTypes.array,
  allIncidents: PropTypes.array,
  fetchAudiences: PropTypes.func,
  fetchSubaudiences: PropTypes.func,
  fetchSubobjectives: PropTypes.func,
  fetchEvents: PropTypes.func,
  fetchIncidentTypes: PropTypes.func,
  fetchIncidents: PropTypes.func,
  fetchInjectTypes: PropTypes.func,
  fetchInjectTypesExerciseSimple: PropTypes.func,
  fetchInjects: PropTypes.func,
  fetchGroups: PropTypes.func,
  downloadFile: PropTypes.func,
  userCanUpdate: PropTypes.bool,
};

const filterAudiences = (audiences, exerciseId) => {
  const audiencesFilterAndSorting = R.pipe(
    R.values,
    R.filter((n) => n.audience_exercise === exerciseId),
    R.sortWith([R.ascend(R.prop('audience_name'))]),
  );
  return audiencesFilterAndSorting(audiences);
};

const filterSubaudiences = (subaudiences, exerciseId) => {
  const subaudiencesFilterAndSorting = R.pipe(
    R.values,
    R.filter((n) => n.subaudience_exercise === exerciseId),
    R.sortWith([R.ascend(R.prop('subaudience_name'))]),
  );
  return subaudiencesFilterAndSorting(subaudiences);
};

const filterSubobjectives = (subobjectives, exerciseId) => {
  const subobjectivesFilterAndSorting = R.pipe(
    R.values,
    R.filter((n) => n.subobjective_exercise === exerciseId),
    R.sortWith([R.ascend(R.prop('subobjective_priority'))]),
  );
  return subobjectivesFilterAndSorting(subobjectives);
};

const filterIncidents = (incidents, eventId) => {
  const incidentsFilterAndSorting = R.pipe(
    R.values,
    R.filter((n) => n.incident_event === eventId),
    R.sortWith([R.ascend(R.prop('incident_order'))]),
  );
  return incidentsFilterAndSorting(incidents);
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
            if (user === userId) {
              userCanUpdate = true;
            }
          });
        }
      });
    });
  }

  return userCanUpdate;
};

const select = (state, ownProps) => {
  const { id: exerciseId, eventId } = ownProps;
  const audiences = filterAudiences(
    state.referential.entities.audiences,
    exerciseId,
  );
  const subaudiences = filterSubaudiences(
    state.referential.entities.subaudiences,
    exerciseId,
  );
  const subobjectives = filterSubobjectives(
    state.referential.entities.subobjectives,
    exerciseId,
  );
  const event = R.prop(eventId, state.referential.entities.events);
  const incidents = filterIncidents(
    state.referential.entities.incidents,
    eventId,
  );
  // region get default incident
  const stateCurrentIncident = R.path(
    ['exercise', exerciseId, 'event', eventId, 'current_incident'],
    state.screen,
  );
  const incidentId = stateCurrentIncident === undefined && incidents.length > 0
    ? R.head(incidents).incident_id
    : stateCurrentIncident; // Force a default incident if needed
  const incident = incidentId
    ? R.find((a) => a.incident_id === incidentId)(incidents)
    : undefined;
  // endregion
  const userCanUpdate = checkUserCanUpdate(state, ownProps);
  return {
    exerciseId,
    eventId,
    event,
    incident,
    incidents,
    audiences,
    subaudiences,
    subobjectives,
    injects: state.referential.entities.injects,
    incident_types: state.referential.entities.incident_types,
    inject_types: state.referential.entities.inject_types,
    allIncidents: R.values(state.referential.entities.incidents),
    userCanUpdate,
  };
};

export default R.compose(
  connect(select, {
    fetchAudiences,
    fetchSubaudiences,
    fetchSubobjectives,
    fetchEvents,
    fetchIncidentTypes,
    fetchIncidents,
    fetchInjectTypes,
    fetchInjectTypesExerciseSimple,
    fetchInjects,
    fetchGroups,
    downloadFile,
  }),
  withStyles(styles),
)(Index);
