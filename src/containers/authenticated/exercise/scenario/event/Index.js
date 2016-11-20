import React, {Component, PropTypes} from 'react'
import R from 'ramda'
import moment from 'moment';
import {Map, fromJS} from 'immutable'
import createImmutableSelector from '../../../../../utils/ImmutableSelect'
import {connect} from 'react-redux'
import {Toolbar, ToolbarTitle} from '../../../../../components/Toolbar'
import {List} from '../../../../../components/List'
import {MainListItem} from '../../../../../components/list/ListItem';
import {fetchInjectsOfEvent} from '../../../../../actions/Inject'
import {fetchInjectTypes} from '../../../../../actions/InjectType'
import {fetchInjectStatuses} from '../../../../../actions/InjectStatuses'
import * as Constants from '../../../../../constants/ComponentTypes';
import IncidentNav from './IncidentNav'
import EventPopover from './EventPopover'
import IncidentPopover from './IncidentPopover'
import CreateInject from './CreateInject'
import InjectPopover from './InjectPopover'

const filterInjects = (injects, incidentId) => {
  var filterByIncident = n => n.inject_incident === incidentId
  var filteredInjects = R.filter(filterByIncident, injects.toJS())
  return fromJS(filteredInjects)
}

const styles = {
  'container': {
    paddingRight: '300px',
  },
  'title': {
    float: 'left',
    fontSize: '20px',
    fontWeight: 600
  },
  'empty': {
    marginTop: 40,
    fontSize: '18px',
    fontWeight: 500,
    textAlign: 'center'
  },
  'number': {
    float: 'right',
    color: '#9E9E9E',
    fontSize: '12px',
  },
  'inject_title': {
    float: 'left',
    width: '40%',
    padding: '5px 0 0 0'
  },
  'inject_date': {
    float: 'left',
    width: '20%',
    padding: '5px 0 0 0'
  },
  'inject_type': {
    float: 'left',
    width: '20%',
    padding: '5px 0 0 0'
  }
}

class Index extends Component {
  componentDidMount() {
    this.props.fetchInjectTypes()
    this.props.fetchInjectStatuses()
    this.props.fetchInjectsOfEvent(this.props.exerciseId, this.props.eventId)
  }

  render() {
    if (this.props.incident.get('incident_id') === undefined && this.props.event) {
      return (
        <div style={styles.container}>
          <IncidentNav exerciseId={this.props.exerciseId} eventId={this.props.eventId}/>
          <div style={styles.empty}>This event is empty.</div>
          <Toolbar type={Constants.TOOLBAR_TYPE_EVENT}>
            <ToolbarTitle type={Constants.TOOLBAR_TYPE_EVENT} text={this.props.event.get('event_title')}/>
            <EventPopover exerciseId={this.props.exerciseId} eventId={this.props.eventId}/>
          </Toolbar>
        </div>
      )
    }

    return (
      <div style={styles.container}>
        <IncidentNav exerciseId={this.props.exerciseId} eventId={this.props.eventId}/>
        <div style={styles.title}>{this.props.incident.get('incident_title')}</div>
        <IncidentPopover exerciseId={this.props.exerciseId} eventId={this.props.eventId}
                         incidentId={this.props.incident.get('incident_id')}/>
        <div style={styles.number}>{this.props.incident_injects.count()} injects</div>
        <div className="clearfix"></div>
        {this.props.incident_injects.count() === 0 ? <div style={styles.empty}>This incident is empty.</div> : ""}
        <List>
          {this.props.incident_injects.toList().map(inject => {
            return (
              <MainListItem
                key={inject.get('inject_id')}
                rightIconButton={
                  <InjectPopover
                    exerciseId={this.props.exerciseId}
                    eventId={this.props.eventId}
                    incidentId={this.props.incident.get('incident_id')}
                    injectId={inject.get('inject_id')}
                  />
                }
                primaryText={
                  <div>
                    <div style={styles.inject_title}>{inject.get('inject_title')}</div>
                    <div
                      style={styles.inject_date}>{moment(inject.get('inject_date')).format('MMM D, YYYY HH:mm:ss')}</div>
                    <div style={styles.inject_type}>{inject.get('inject_type')}</div>
                    <div className="clearfix"></div>
                  </div>
                }
              />
            )
          })}
        </List>
        <CreateInject exerciseId={this.props.exerciseId} eventId={this.props.eventId}
                      incidentId={this.props.incident.get('incident_id')}/>
        <Toolbar type={Constants.TOOLBAR_TYPE_EVENT}>
          <ToolbarTitle type={Constants.TOOLBAR_TYPE_EVENT}
                        text={this.props.event ? this.props.event.get('event_title') : ""}/>
          <EventPopover exerciseId={this.props.exerciseId} eventId={this.props.eventId}/>
        </Toolbar>
      </div>
    );
  }
}

Index.propTypes = {
  exerciseId: PropTypes.string,
  eventId: PropTypes.string,
  event: PropTypes.object,
  incidentId: PropTypes.string,
  incident: PropTypes.object,
  incident_injects: PropTypes.object,
  injects: PropTypes.object,
  fetchInjectTypes: PropTypes.func,
  fetchInjectStatuses: PropTypes.func,
  fetchInjectsOfEvent: PropTypes.func,
}

const filteredInjects = createImmutableSelector(
  (state, incidentId) => filterInjects(state.application.getIn(['entities', 'injects']), incidentId),
  injects => injects)

const select = (state, ownProps) => {
  let exerciseId = ownProps.params.exerciseId
  let eventId = ownProps.params.eventId
  let event = state.application.getIn(['entities', 'events', eventId])
  let incidents = state.application.getIn(['entities', 'incidents'])
  let currentIncident = state.application.getIn(['ui', 'states', 'current_incidents', exerciseId, eventId])
  let incident = currentIncident ? incidents.get(currentIncident) : Map()
  let incidentInjects = currentIncident ? filteredInjects(state, currentIncident) : Map()

  return {
    exerciseId,
    eventId,
    event,
    incident,
    inject_types: state.application.getIn(['entities', 'inject_types']),
    injects: state.application.getIn(['entities', 'injects']),
    incident_injects: incidentInjects
  }
}

export default connect(select, {fetchInjectTypes, fetchInjectStatuses, fetchInjectsOfEvent})(Index);