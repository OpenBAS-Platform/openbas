import React, {PropTypes, Component} from 'react'
import {connect} from 'react-redux'
import R from 'ramda'
import * as Constants from '../../../../../constants/ComponentTypes'
import {fetchEvents} from '../../../../../actions/Event'
import {fetchIncidents, selectIncident} from '../../../../../actions/Incident'
import {fetchIncidentTypes} from '../../../../../actions/IncidentType'
import {Drawer} from '../../../../../components/Drawer'
import {List} from '../../../../../components/List'
import {ListItemLink} from '../../../../../components/list/ListItem';
import {Icon} from '../../../../../components/Icon'
import CreateIncident from './CreateIncident'

class IncidentNav extends Component {
    
  componentDidMount() {
    this.props.fetchEvents(this.props.exerciseId)
    this.props.fetchIncidentTypes()
    this.props.fetchIncidents(this.props.exerciseId, this.props.eventId)
  }

  handleChangeIncident(incidentId) {
    this.props.selectIncident(this.props.exerciseId, this.props.eventId, incidentId)
  }

  render() {
    return (
      <Drawer width={300} docked={true} open={true} openSecondary={true} zindex={50}>
        <CreateIncident exerciseId={this.props.exerciseId} eventId={this.props.eventId}/>
        <List>
          {this.props.incidents.map(incident => {
            return (
              <ListItemLink
                type={Constants.LIST_ITEM_NOSPACE}
                key={incident.incident_id}
                active={this.props.incident.incident_id === incident.incident_id}
                onClick={this.handleChangeIncident.bind(this, incident.incident_id)}
                label={incident.incident_title}
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
  incident: PropTypes.object,
  incidents: PropTypes.array,
  fetchEvents: PropTypes.func,
  fetchIncidents: PropTypes.func,
  fetchIncidentTypes: PropTypes.func,
  selectIncident: PropTypes.func
}

const filterIncidents = (incidents, eventId) => {
    console.log(incidents)
    let incidentsFilterAndSorting = R.pipe(
        R.values,
        R.filter(n => n.incident_event === eventId),
        R.sort((a, b) => a.incident_title.localeCompare(b.incident_title))
    )
    return incidentsFilterAndSorting(incidents)
}

const select = (state, props) => {
  return {
    incidents: filterIncidents(state.referential.entities.incidents, props.eventId),
  }
}

export default connect(select, {fetchEvents, fetchIncidentTypes, fetchIncidents, selectIncident})(IncidentNav);
