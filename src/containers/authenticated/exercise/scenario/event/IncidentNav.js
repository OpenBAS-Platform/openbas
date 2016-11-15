import React, {PropTypes, Component} from 'react'
import {connect} from 'react-redux'
import createImmutableSelector from '../../../../../utils/ImmutableSelect'
import {fromJS} from 'immutable'
import R from 'ramda'
import * as Constants from '../../../../../constants/ComponentTypes'
import {fetchIncidents, selectIncident} from '../../../../../actions/Incident'
import {fetchIncidentTypes} from '../../../../../actions/IncidentType'
import {Drawer} from '../../../../../components/Drawer'
import {List} from '../../../../../components/List'
import {ListItemLink} from '../../../../../components/list/ListItem';
import {Icon} from '../../../../../components/Icon'
import CreateIncident from './CreateIncident'

const filterIncidents = (incidents, eventId) => {
  var filterByEvent = n => n.incident_event === eventId
  var filteredIncidents = R.filter(filterByEvent, incidents.toJS())
  return fromJS(filteredIncidents)
}

class IncidentNav extends Component {
  componentDidMount() {
    this.props.fetchIncidentTypes()
    this.props.fetchIncidents(this.props.exerciseId, this.props.eventId)
  }

  handleChangeIncident(incidentId) {
    this.props.selectIncident(this.props.exerciseId, this.props.eventId, incidentId)
  }

  componentWillReceiveProps(nextProps) {
    let incidents = filterIncidents(nextProps.incidents, nextProps.eventId)
    if(nextProps.currentIncident === undefined && incidents.count() > 0) {
      this.props.selectIncident(nextProps.exerciseId, nextProps.eventId, incidents.keySeq().first())
    }
  }

  render() {
    return (
      <Drawer width={300} docked={true} open={true} openSecondary={true} zindex={50}>
        <CreateIncident exerciseId={this.props.exerciseId} eventId={this.props.eventId}/>
        <List>
          {this.props.incidents.toList().map(incident => {
            return (
              <ListItemLink
                key={incident.get('incident_id')}
                active={this.props.currentIncident === incident.get('incident_id')}
                onClick={this.handleChangeIncident.bind(this, incident.get('incident_id'))}
                label={incident.get('incident_title')}
                leftIcon={<Icon name={Constants.ICON_NAME_SOCIAL_GROUP}/>}
              />
            )
          })}
        </List>
      </Drawer>
    );
  }
}

IncidentNav.propTypes = {
  exerciseId: PropTypes.string,
  eventId: PropTypes.string,
  currentIncident: PropTypes.string,
  incidents: PropTypes.object,
  fetchIncidents: PropTypes.func,
  fetchIncidentTypes: PropTypes.func,
  selectIncident: PropTypes.func
}

const filteredIncidents = createImmutableSelector(
  (state, props) => filterIncidents(state.application.getIn(['entities', 'incidents']), props.eventId),
  incidents => incidents)

const select = (state, props) => {
  return {
    incidents: filteredIncidents(state, props),
    currentIncident: state.application.getIn(['ui', 'states', 'current_incidents', props.exerciseId,  props.eventId])
  }
}

export default connect(select, {fetchIncidentTypes, fetchIncidents, selectIncident})(IncidentNav);