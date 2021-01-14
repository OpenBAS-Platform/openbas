import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as R from 'ramda';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import { dateFormat } from '../../../../../utils/Time';
import { i18nRegister } from '../../../../../utils/Messages';
import { T } from '../../../../../components/I18n';
import Theme from '../../../../../components/Theme';
import { Toolbar } from '../../../../../components/Toolbar';
import { List } from '../../../../../components/List';
import {
  HeaderItem,
  MainListItem,
} from '../../../../../components/list/ListItem';
import { Icon } from '../../../../../components/Icon';
import { SearchField } from '../../../../../components/SimpleTextField';
/* eslint-disable */
import { fetchAudiences } from "../../../../../actions/Audience";
import { fetchSubaudiences } from "../../../../../actions/Subaudience";
import { fetchSubobjectives } from "../../../../../actions/Subobjective";
import { downloadFile } from "../../../../../actions/File";
import { fetchEvents } from "../../../../../actions/Event";
import {
  fetchIncidents,
  fetchIncidentTypes,
} from "../../../../../actions/Incident";
import {
  fetchInjects,
  fetchInjectTypes,
  fetchInjectTypesExerciseSimple,
} from "../../../../../actions/Inject";
import { fetchGroups } from "../../../../../actions/Group";
import * as Constants from "../../../../../constants/ComponentTypes";
import IncidentNav from "./IncidentNav";
import EventPopover from "./EventPopover";
import IncidentPopover from "./IncidentPopover";
import CreateInject from "./CreateInject";
import InjectPopover from "./InjectPopover";
import InjectView from "./InjectView";
/* eslint-enable */

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

const styles = {
  container: {
    paddingRight: '300px',
  },
  header: {
    icon: {
      fontSize: '12px',
      textTransform: 'uppercase',
      fontWeight: '700',
      padding: '8px 0 0 8px',
    },
    inject_title: {
      float: 'left',
      width: '50%',
      fontSize: '12px',
      textTransform: 'uppercase',
      fontWeight: '700',
    },
    inject_date: {
      float: 'left',
      width: '20%',
      fontSize: '12px',
      textTransform: 'uppercase',
      fontWeight: '700',
    },
    inject_user: {
      float: 'left',
      width: '18%',
      fontSize: '12px',
      textTransform: 'uppercase',
      fontWeight: '700',
    },
    inject_audiences: {
      float: 'left',
      textAlign: 'center',
      width: '2%',
      fontSize: '12px',
      textTransform: 'uppercase',
      fontWeight: '700',
    },
  },
  title: {
    float: 'left',
    fontSize: '13px',
    textTransform: 'uppercase',
  },
  subobjectives: {
    float: 'left',
    fontSize: '12px',
    color: Theme.palette.accent3Color,
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
  inject_title: {
    float: 'left',
    width: '50%',
    padding: '5px 0 0 0',
  },
  inject_date: {
    float: 'left',
    width: '20%',
    padding: '5px 0 0 0',
  },
  inject_user: {
    width: '18%',
    float: 'left',
    padding: '5px 0 0 0',
  },
  inject_audiences: {
    width: '2%',
    float: 'left',
    padding: '5px 0 0 0',
    textAlign: 'center',
  },
};

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

  handleSearchInjects(event, value) {
    this.setState({ searchTerm: value });
  }

  reverseBy(field) {
    this.setState({
      sortBy: field,
      orderAsc: !this.state.orderAsc,
    });
  }

  SortHeader(field, label) {
    const icon = this.state.orderAsc
      ? Constants.ICON_NAME_NAVIGATION_ARROW_DROP_DOWN
      : Constants.ICON_NAME_NAVIGATION_ARROW_DROP_UP;
    const IconDisplay = this.state.sortBy === field ? (
        <Icon type={Constants.ICON_TYPE_SORT} name={icon} />
    ) : (
      ''
    );
    return (
      <div
        style={styles.header[field]}
        onClick={this.reverseBy.bind(this, field)}
      >
        <T>{label}</T>
        {IconDisplay}
      </div>
    );
  }

  SortHeader2(field, element) {
    const icon = this.state.orderAsc
      ? Constants.ICON_NAME_NAVIGATION_ARROW_DROP_DOWN
      : Constants.ICON_NAME_NAVIGATION_ARROW_DROP_UP;
    const IconDisplay = this.state.sortBy === field ? (
        <Icon type={Constants.ICON_TYPE_SORT} name={icon} />
    ) : (
      ''
    );
    return (
      <div
        style={styles.header[field]}
        onClick={this.reverseBy.bind(this, field)}
      >
        {element}
        {IconDisplay}
      </div>
    );
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
  selectIcon(type, color) {
    switch (type) {
      case 'openex_email':
        return (
          <Icon
            name={Constants.ICON_NAME_CONTENT_MAIL}
            type={Constants.ICON_TYPE_MAINLIST}
            color={color}
          />
        );
      case 'openex_ovh_sms':
        return (
          <Icon
            name={Constants.ICON_NAME_NOTIFICATION_SMS}
            type={Constants.ICON_TYPE_MAINLIST}
            color={color}
          />
        );
      case 'openex_manual':
        return (
          <Icon
            name={Constants.ICON_NAME_ACTION_INPUT}
            type={Constants.ICON_TYPE_MAINLIST}
            color={color}
          />
        );
      default:
        return (
          <Icon
            name={Constants.ICON_NAME_CONTENT_MAIL}
            type={Constants.ICON_TYPE_MAINLIST}
            color={color}
          />
        );
    }
  }

  // eslint-disable-next-line class-methods-use-this
  switchColor(disabled) {
    if (disabled) {
      return Theme.palette.disabledColor;
    }
    return Theme.palette.textColor;
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

  render() {
    const viewActions = [
      <Button
        key="close"
        label="Close"
        primary={true}
        onClick={this.handleCloseView.bind(this)}
      />,
    ];

    const {
      exerciseId, eventId, event, incident, incidents,
    } = this.props;
    const eventIsUpdatable = R.propOr(
      true,
      'user_can_update',
      this.props.event,
    );

    if (event && incident) {
      const keyword = this.state.searchTerm;
      const filterByKeyword = (n) => keyword === ''
        || n.inject_title.toLowerCase().indexOf(keyword.toLowerCase()) !== -1
        || n.inject_description.toLowerCase().indexOf(keyword.toLowerCase())
          !== -1
        || n.inject_content.toLowerCase().indexOf(keyword.toLowerCase()) !== -1;

      const injects = R.pipe(
        R.map((data) => R.pathOr({}, ['injects', data.inject_id], this.props)),
        R.filter(filterByKeyword),
        R.sort((a, b) => {
          // TODO replace with sortWith after Ramdajs new release
          const fieldA = R.toLower(
            R.propOr('', this.state.sortBy, a).toString(),
          );
          const fieldB = R.toLower(
            R.propOr('', this.state.sortBy, b).toString(),
          );
          return this.state.orderAsc
            ? this.ascend(fieldA, fieldB)
            : this.descend(fieldA, fieldB);
        }),
      )(incident.incident_injects);

      // Display the component
      return (
        <div style={styles.container}>
          <IncidentNav
            selectedIncident={incident.incident_id}
            exerciseId={exerciseId}
            eventId={eventId}
            incidents={incidents}
            incident_types={this.props.incident_types}
            subobjectives={this.props.subobjectives}
            can_create={eventIsUpdatable && this.props.userCanUpdate}
          />
          <div>
            <div style={styles.title}>
              {incident.incident_title}
              &nbsp;
            </div>
            {this.props.userCanUpdate ? (
              <IncidentPopover
                exerciseId={exerciseId}
                eventId={eventId}
                incident={incident}
                subobjectives={this.props.subobjectives}
                incidentSubobjectivesIds={incident.incident_subobjectives.map(
                  (i) => i.subobjective_id,
                )}
                incident_types={this.props.incident_types}
              />
            ) : (
              ''
            )}

            <div style={styles.subobjectives}>
              {incident.incident_subobjectives.length}
              &nbsp;
              <T>linked subobjective(s)</T>
            </div>

            <div style={styles.search}>
              <SearchField
                name="keyword"
                fullWidth={true}
                type="text"
                hintText="Search"
                onChange={this.handleSearchInjects.bind(this)}
                styletype={Constants.FIELD_TYPE_RIGHT}
              />
            </div>

            <div className="clearfix" />

            <List>
              {incident.incident_injects.length === 0 ? (
                <div style={styles.empty}>
                  <T>This incident is empty.</T>
                </div>
              ) : (
                <HeaderItem
                  leftIcon={<span style={styles.header.icon}>#</span>}
                  rightIconButton={<Icon style={{ display: 'none' }} />}
                  primaryText={
                    <div>
                      {this.SortHeader('inject_title', 'Title')}
                      {this.SortHeader('inject_date', 'Date')}
                      {this.SortHeader('inject_user', 'Author')}
                      {this.SortHeader2(
                        'inject_users_number',
                        <Icon name={Constants.ICON_NAME_SOCIAL_GROUP} />,
                      )}
                      <div className="clearfix" />
                    </div>
                  }
                />
              )}

              {injects.map((inject) => {
                // Setup variables
                const injectId = R.propOr(Math.random(), 'inject_id', inject);
                const injectTitle = R.propOr('-', 'inject_title', inject);
                const injectUser = R.propOr('-', 'inject_user', inject);
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
                  <MainListItem
                    key={injectId}
                    leftIcon={this.selectIcon(
                      injectType,
                      this.switchColor(!injectEnabled || injectDisabled),
                    )}
                    onClick={this.handleOpenView.bind(this, inject)}
                    rightIconButton={
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
                    }
                    primaryText={
                      <div>
                        <div style={styles.inject_title}>
                          <span
                            style={{
                              color: this.switchColor(
                                !injectEnabled || injectDisabled,
                              ),
                            }}
                          >
                            {injectTitle}
                          </span>
                        </div>
                        <div style={styles.inject_date}>
                          <span
                            style={{
                              color: this.switchColor(
                                !injectEnabled || injectDisabled,
                              ),
                            }}
                          >
                            {dateFormat(injectDate)}
                          </span>
                        </div>
                        <div style={styles.inject_user}>
                          <span
                            style={{
                              color: this.switchColor(
                                !injectEnabled || injectDisabled,
                              ),
                            }}
                          >
                            {injectUser}
                          </span>
                        </div>
                        <div style={styles.inject_audiences}>
                          <span
                            style={{
                              color: this.switchColor(
                                !injectEnabled || injectDisabled,
                              ),
                            }}
                          >
                            {injectUsersNumber.toString()}
                          </span>
                        </div>
                        <div className="clearfix" />
                      </div>
                    }
                  />
                );
              })}
            </List>

            {eventIsUpdatable && this.props.userCanUpdate ? (
              <CreateInject
                exerciseId={exerciseId}
                eventId={eventId}
                incidentId={incident.incident_id}
                inject_types={this.props.inject_types}
                audiences={this.props.audiences}
                subaudiences={this.props.subaudiences}
              />
            ) : (
              ''
            )}
            <Toolbar type={Constants.TOOLBAR_TYPE_EVENT}>
              <EventPopover
                exerciseId={exerciseId}
                eventId={eventId}
                event={event}
                reloadEvent={this.reloadEvent.bind(this)}
                userCanUpdate={this.props.userCanUpdate}
              />
            </Toolbar>
            <Dialog
              title={R.propOr('-', 'inject_title', this.state.currentInject)}
              modal={false}
              open={this.state.openView}
              autoScrollBodyContent={true}
              onRequestClose={this.handleCloseView.bind(this)}
              actions={viewActions}
            >
              <InjectView
                downloadAttachment={this.downloadAttachment.bind(this)}
                inject={this.state.currentInject}
                audiences={this.props.audiences}
                subaudiences={this.props.subaudiences}
              />
            </Dialog>
          </div>
        </div>
      );
    }
    if (event) {
      return (
        <div style={styles.container}>
          <IncidentNav
            exerciseId={exerciseId}
            eventId={eventId}
            incidents={incidents}
            incident_types={this.props.incident_types}
            can_create={eventIsUpdatable && this.props.userCanUpdate}
          />
          <div style={styles.empty}>
            <T>This event is empty.</T>
          </div>
          <Toolbar type={Constants.TOOLBAR_TYPE_EVENT}>
            <EventPopover
              exerciseId={exerciseId}
              eventId={eventId}
              event={event}
              reloadEvent={this.reloadEvent.bind(this)}
              userCanUpdate={this.props.userCanUpdate}
            />
          </Toolbar>
        </div>
      );
    }
    return <div style={styles.container}> &nbsp; </div>;
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
    R.filter((n) => n.audience_exercise.exercise_id === exerciseId),
    R.sort((a, b) => a.audience_name.localeCompare(b.audience_name)),
  );
  return audiencesFilterAndSorting(audiences);
};

const filterSubaudiences = (subaudiences, exerciseId) => {
  const subaudiencesFilterAndSorting = R.pipe(
    R.values,
    R.filter((n) => n.subaudience_exercise === exerciseId),
    R.sort((a, b) => a.subaudience_name.localeCompare(b.subaudience_name)),
  );
  return subaudiencesFilterAndSorting(subaudiences);
};

const filterSubobjectives = (subobjectives, exerciseId) => {
  const subobjectivesFilterAndSorting = R.pipe(
    R.values,
    R.filter((n) => n.subobjective_exercise === exerciseId),
    R.sort((a, b) => a.subobjective_title.localeCompare(b.subobjective_title)),
  );
  return subobjectivesFilterAndSorting(subobjectives);
};

const filterIncidents = (incidents, eventId) => {
  const incidentsFilterAndSorting = R.pipe(
    R.values,
    R.filter((n) => n.incident_event.event_id === eventId),
    R.sort((a, b) => a.incident_order > b.incident_order),
  );
  return incidentsFilterAndSorting(incidents);
};

const checkUserCanUpdate = (state, ownProps) => {
  const { exerciseId } = ownProps.params;
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

const select = (state, ownProps) => {
  const { exerciseId } = ownProps.params;
  const { eventId } = ownProps.params;
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

export default connect(select, {
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
})(Index);
