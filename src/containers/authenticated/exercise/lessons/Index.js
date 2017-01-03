import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import R from 'ramda'
import {T} from '../../../../components/I18n'
import {i18nRegister} from '../../../../utils/Messages'
import {dateFormat} from '../../../../utils/Time'
import * as Constants from '../../../../constants/ComponentTypes'
import {List} from '../../../../components/List'
import {MainListItem} from '../../../../components/list/ListItem';
import {Icon} from '../../../../components/Icon'
import {LinearProgress} from '../../../../components/LinearProgress'
import {fetchIncidents} from '../../../../actions/Incident'
import {fetchLogs} from '../../../../actions/Log'
import LogsPopover from './LogsPopover'
import LogPopover from './LogPopover'
import IncidentPopover from './IncidentPopover'

i18nRegister({
  fr: {
    'Incidents outcomes': 'Résultats des incidents',
    'You do not have any incidents in this exercise.': 'Vous n\'avez aucun incident dans cet exercice.',
    'Exercise log': 'Journal d\'exercice',
    'You do not have any entries in the exercise log.': 'Vous n\'avez aucune entrée dans le journal de cet exercice.'
  }
})

const styles = {
  'container': {
    textAlign: 'center'
  },
  'columnLeft': {
    float: 'left',
    width: '48%',
    margin: 0,
    padding: 0,
    textAlign: 'left'
  },
  'columnRight': {
    float: 'right',
    width: '48%',
    margin: 0,
    padding: 0,
    textAlign: 'left'
  },
  'headtitle': {
    fontWeight: '600',
    fontSize: '18px'
  },
  'headsubtitle': {
    fontSize: '15px'
  },
  'title': {
    float: 'left',
    fontSize: '13px',
    textTransform: 'uppercase',
    height: '35px'
  },
  'empty': {
    marginTop: 30,
    fontSize: '18px',
    fontWeight: 500,
    textAlign: 'left'
  },
  'log_title': {
    float: 'left',
    padding: '5px 0px 0px 0px'
  },
  'incident_result': {
    position: 'absolute',
    width: '140px',
    right: '45px',
    top: '38px',
    fontSize: '14px'
  },
  'log_date': {
    position: 'absolute',
    width: '140px',
    right: '45px',
    top: '34px',
    fontSize: '14px'
  },
  'log_content': {
    padding: '0px 35px 0px 0px',
    textAlign: 'justify'
  }
}

class IndexExerciseLessons extends Component {
  componentDidMount() {
    this.props.fetchLogs(this.props.exerciseId)
    this.props.fetchIncidents(this.props.exerciseId)
  }

  render() {
    return (
      <div style={styles.container}>
        <div style={styles.columnLeft}>
          <div style={styles.title}><T>Incidents outcomes</T></div>
          <div className="clearfix"></div>
          {this.props.incidents.length === 0 ?
            <div style={styles.empty}><T>You do not have any incidents in this exercise.</T></div> : ""}
          <List>
            {this.props.incidents.map(incident => {
              return (
                <MainListItem
                  key={incident.incident_id}
                  rightIconButton={<IncidentPopover exerciseId={this.props.exerciseId} incident={incident}/>}
                  primaryText={
                    <div>
                      <div style={styles.log_title}>{incident.incident_title}</div>
                      <div style={styles.incident_result}>
                        <LinearProgress mode="determinate" min={0} max={100}
                                        value={incident.incident_outcome.outcome_result}/>
                      </div>
                      <div className="clearfix"></div>
                    </div>
                  }
                  secondaryText={<div style={styles.log_content}>{incident.incident_outcome.outcome_comment === null ?
                    <i><T>No comment for this incident.</T></i> :
                    <i>{incident.incident_outcome.outcome_comment}</i>}</div>}
                  leftIcon={<Icon name={Constants.ICON_NAME_MAPS_LAYERS} type={Constants.ICON_TYPE_MAINLIST2}/>}
                />
              )
            })}
          </List>
        </div>
        <div style={styles.columnRight}>
          <div style={styles.title}><T>Exercise log</T></div>
          <LogsPopover exerciseId={this.props.exerciseId}/>
          <div className="clearfix"></div>
          {this.props.logs.length === 0 ?
            <div style={styles.empty}><T>You do not have any entries in the exercise log.</T></div> : ""}
          <List>
            {this.props.logs.map(log => {
              return (
                <MainListItem
                  key={log.log_id}
                  rightIconButton={<LogPopover exerciseId={this.props.exerciseId} log={log}/>}
                  primaryText={
                    <div>
                      <div style={styles.log_title}>{log.log_title}</div>
                      <div style={styles.log_date}>{dateFormat(log.log_date)}</div>
                      <div className="clearfix"></div>
                    </div>
                  }
                  secondaryText={<div style={styles.log_content}>{log.log_content}</div>}
                  leftIcon={<Icon name={Constants.ICON_NAME_ACTION_DESCRIPTION}
                                  type={Constants.ICON_TYPE_MAINLIST2}/>}
                />
              )
            })}
          </List>
        </div>
      </div>
    )
  }
}

IndexExerciseLessons.propTypes = {
  exerciseId: PropTypes.string,
  logs: PropTypes.array,
  incidents: PropTypes.array,
  fetchLogs: PropTypes.func,
  fetchIncidents: PropTypes.func
}

const filterLogs = (logs, exerciseId) => {
  let logsFilterAndSorting = R.pipe(
    R.values,
    R.filter(n => n.log_exercise.exercise_id === exerciseId),
    R.sort((a, b) => a.log_date < b.log_date)
  )
  return logsFilterAndSorting(logs)
}

const filterIncidents = (incidents, exerciseId) => {
  let incidentsFilterAndSorting = R.pipe(
    R.values,
    R.filter(n => n.incident_exercise === exerciseId),
    R.sort((a, b) => a.incident_title.localeCompare(b.incident_title))
  )
  return incidentsFilterAndSorting(incidents)
}

const select = (state, ownProps) => {
  let exerciseId = ownProps.params.exerciseId
  let logs = filterLogs(state.referential.entities.logs, exerciseId)
  let incidents = filterIncidents(state.referential.entities.incidents, exerciseId)

  return {
    exerciseId,
    logs,
    incidents
  }
}

export default connect(select, {fetchLogs, fetchIncidents})(IndexExerciseLessons)