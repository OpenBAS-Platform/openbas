import React, {Component, PropTypes} from 'react'
import {Map} from 'immutable'
import {connect} from 'react-redux'
import {List} from '../../../../../components/List'
import {MainListItem} from '../../../../../components/list/ListItem';
import {fetchInjectsOfEvent} from '../../../../../actions/Inject'
import IncidentNav from './IncidentNav'
import IncidentPopover from './IncidentPopover'
import CreateInject from './CreateInject'

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
    width: '30%',
    padding: '5px 0 0 0'
  },
  'inject_description': {
    float: 'left',
    width: '40%',
    padding: '5px 0 0 0'
  },
  'inject_date': {
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
    this.props.fetchInjectsOfEvent(this.props.exerciseId, this.props.eventId)
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
        <div style={styles.number}>{this.props.incident_injects.count()} injects</div>
        <div className="clearfix"></div>
        {this.props.incident_injects.count() === 0 ? <div style={styles.empty}>This incident is empty.</div>:""}
        <List>
          {this.props.incident_injects.toList().map(injectId => {
            let inject = this.props.injects.get(injectId)
            return (
              <MainListItem
                key={inject.get('inject_id')}
                rightIconButton={
                  <div style={styles.popover}>

                  </div>
                }
                primaryText={
                  <div>
                    <div style={styles.inject_title}>{inject.get('inject_title')}</div>
                    <div style={styles.inject_description}>{inject.get('inject_description')}</div>
                    <div style={styles.inject_date}></div>
                    <div className="clearfix"></div>
                  </div>
                }
              />
            )
          })}
        </List>
        <CreateInject exerciseId={this.props.exerciseId} eventId={this.props.eventId} incidentId={this.props.incident.get('incident_id')}/>
      </div>
    );
  }
}

Index.propTypes = {
  exerciseId: PropTypes.string,
  eventId: PropTypes.string,
  incident: PropTypes.object,
  incident_injects: PropTypes.object,
  injects: PropTypes.object,
  fetchInjectsOfEvent: PropTypes.func
}

const select = (state, ownProps) => {
  let exerciseId = ownProps.params.exerciseId
  let eventId = ownProps.params.eventId
  let incidents = state.application.getIn(['entities', 'incidents'])
  let currentIncident = state.application.getIn(['ui', 'states', 'current_incidents', exerciseId, eventId])
  let incident = currentIncident ? incidents.get(currentIncident) : Map()
  let incidentInjects = currentIncident ? incidents.get(currentIncident).get('incident_injects') : Map()

  return {
    exerciseId,
    eventId,
    incident,
    injects: state.application.getIn(['entities', 'injects']),
    incident_injects: incidentInjects
  }
}

export default connect(select, {fetchInjectsOfEvent})(Index);