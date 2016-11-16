import React, {Component, PropTypes} from 'react'
import {Map} from 'immutable'
import {connect} from 'react-redux'
import * as Constants from '../../../../../constants/ComponentTypes'
import {List} from '../../../../../components/List'
import {MainListItem} from '../../../../../components/list/ListItem';
import IncidentNav from './IncidentNav'
import IncidentPopover from './IncidentPopover'

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
  'name': {
    float: 'left',
    width: '30%',
    padding: '5px 0 0 0'
  },
  'mail': {
    float: 'left',
    width: '40%',
    padding: '5px 0 0 0'
  },
  'org': {
    float: 'left',
    padding: '5px 0 0 0'
  },
  'popover': {
    float: 'left',
    padding: '17px 0 0 0'
  }
}

class Index extends Component {
  componentDidMount() {

  }

  render() {
    if (this.props.incident.get('incident_id') === undefined) {
      return (
        <div style={styles.container}>
          <IncidentNav exerciseId={this.props.exerciseId} eventId={this.props.eventId}/>
          <div style={styles.empty}>No incident selected.</div>
        </div>
      )
    }

    return (
      <div style={styles.container}>
        <IncidentNav exerciseId={this.props.exerciseId} eventId={this.props.eventId}/>
        <div style={styles.title}>{this.props.incident.get('incident_title')}</div>
        <IncidentPopover exerciseId={this.props.exerciseId} eventId={this.props.eventId} incidentId={this.props.incident.get('incident_id')}/>
        <div className="clearfix"></div>
      </div>
    );
  }
}

Index.propTypes = {
  exerciseId: PropTypes.string,
  eventId: PropTypes.string,
  incident: PropTypes.object,
}

const select = (state, ownProps) => {
  let exerciseId = ownProps.params.exerciseId
  let eventId = ownProps.params.eventId
  let incidents = state.application.getIn(['entities', 'incidents'])
  let currentIncident = state.application.getIn(['ui', 'states', 'current_incidents', exerciseId, eventId])

  console.log('currentIncident', currentIncident)
  let incident = currentIncident ? incidents.get(currentIncident) : Map()

  return {
    exerciseId,
    eventId,
    incident
  }
}

export default connect(select, null)(Index);