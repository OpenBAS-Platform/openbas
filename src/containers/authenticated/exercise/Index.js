import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import R from 'ramda'
import * as Constants from '../../../constants/ComponentTypes'
import {T} from '../../../components/I18n'
import {i18nRegister} from '../../../utils/Messages'
import {List} from '../../../components/List'
import {MainListItem, SecondaryListItem, TertiaryListItem} from '../../../components/list/ListItem';
import {Icon} from '../../../components/Icon'
import {fetchObjectives} from '../../../actions/Objective'
import {fetchAudiences} from '../../../actions/Audience'
import {fetchEvents} from '../../../actions/Event'
import {fetchIncidents} from '../../../actions/Incident'
import {fetchAllInjects} from '../../../actions/Inject'

i18nRegister({
  fr: {
    'Main objectives': 'Objectifs principaux',
    'Audiences': 'Audiences',
    'You do not have any objectives in this exercise.': 'Vous n\'avez aucun objectif dans cet exercice.',
    'You do not have any audiences in this exercise.': 'Vous n\'avez aucune audience dans cet exercice.',
    'Scenario': 'Scénario',
    'You do not have any events in this exercise.': 'Vous n\'avez aucun événement dans cet exercice.'
  }
})

const styles = {
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
  'title': {
    float: 'left',
    fontSize: '13px',
    textTransform: 'uppercase'
  },
  'priority': {
    fontSize: '18px',
    fontWeight: 500,
    marginRight: '10px'
  },
  'empty': {
    marginTop: 40,
    fontSize: '18px',
    fontWeight: 500,
    textAlign: 'left'
  },
  'inject_title': {
    float: 'left',
    padding: '5px 0 0 0'
  },
  'inject_date': {
    float: 'right',
    width: '130px',
    padding: '5px 0 0 0'
  }
}

class IndexExercise extends Component {
  componentDidMount() {
    this.props.fetchObjectives(this.props.exerciseId)
    this.props.fetchAudiences(this.props.exerciseId)
    this.props.fetchEvents(this.props.exerciseId)
    this.props.fetchIncidents(this.props.exerciseId)
    this.props.fetchAllInjects(this.props.exerciseId)
  }

  selectIcon(type) {
    switch (type) {
      case 'email':
        return <Icon name={Constants.ICON_NAME_CONTENT_MAIL} type={Constants.ICON_TYPE_MAINLIST}/>
      case 'sms':
        return <Icon name={Constants.ICON_NAME_NOTIFICATION_SMS} type={Constants.ICON_TYPE_MAINLIST}/>
      default:
        return <Icon name={Constants.ICON_NAME_CONTENT_MAIL} type={Constants.ICON_TYPE_MAINLIST}/>
    }
  }

  render() {
    return (
      <div>
        <div style={styles.columnLeft}>
          <div style={styles.title}><T>Main objectives</T></div>
          <div className="clearfix"></div>
          {this.props.objectives.length === 0 ?
            <div style={styles.empty}><T>You do not have any objectives in this exercise.</T></div> : ""}
          <List>
            {this.props.objectives.map(objective => {
              return (
                <MainListItem
                  key={objective.objective_id}
                  primaryText={objective.objective_title}
                  secondaryText={objective.objective_description}
                  leftIcon={<Icon name={Constants.ICON_NAME_IMAGE_CENTER_FOCUS_STRONG}/>}
                />
              )
            })}
          </List>
        </div>
        <div style={styles.columnRight}>
          <div style={styles.title}>Audiences</div>
          <div className="clearfix"></div>
          {this.props.audiences.length === 0 ?
            <div style={styles.empty}><T>You do not have any audiences in this exercise.</T></div> : ""}
          <List>
            {this.props.audiences.map(audience => {
              return (
                <MainListItem
                  key={audience.audience_id}
                  primaryText={audience.audience_name}
                  secondaryText={audience.audience_users.length + ' players'}
                  leftIcon={<Icon name={Constants.ICON_NAME_SOCIAL_GROUP}/>}
                />
              )
            })}
          </List>
        </div>
        <div className="clearfix"></div>
        <br /><br />
        <div style={styles.title}><T>Scenario</T></div>
        <div className="clearfix"></div>
        {this.props.events.length === 0 ?
          <div style={styles.empty}><T>You do not have any events in this exercise.</T></div> : ""}
        <List>
          {this.props.events.map(event => {
            let nestedItems = event.event_incidents.map(data => {
                let incident = R.propOr({}, data.incident_id, this.props.incidents)
                let incident_id = R.propOr(data.incident_id, 'incident_id', incident)
                let incident_title = R.propOr('-', 'incident_title', incident)
                let incident_story = R.propOr('-', 'incident_story', incident)
                let incident_injects = R.propOr([], 'incident_injects', incident)

                let nestedItems2 = incident_injects.map(data2 => {
                    let inject = R.propOr({}, data2.inject_id, this.props.injects)
                    let inject_id = R.propOr(data2.inject_id, 'inject_id', inject)
                    let inject_title = R.propOr('-', 'inject_title', inject)
                    let inject_description = R.propOr('-', 'inject_description', inject)
                    let inject_type = R.propOr('-', 'inject_type', inject)

                    return <TertiaryListItem
                      key={inject_id}
                      leftIcon={this.selectIcon(inject_type)}
                      primaryText={inject_title}
                      secondaryText={inject_description}/>
                  }
                )
                return <SecondaryListItem
                  key={incident_id}
                  leftIcon={<Icon name={Constants.ICON_NAME_MAPS_LAYERS}/>}
                  primaryText={incident_title}
                  secondaryText={incident_story}
                  nestedItems={nestedItems2}/>
              }
            )

            return (
              <MainListItem
                key={event.event_id}
                leftIcon={<Icon name={Constants.ICON_NAME_ACTION_EVENT}/>}
                primaryText={event.event_title}
                secondaryText={event.event_description}
                nestedItems={nestedItems}
              />
            )
          })}
        </List>
      </div>
    )
  }
}

IndexExercise.propTypes = {
  exerciseId: PropTypes.string,
  objectives: PropTypes.array,
  audiences: PropTypes.array,
  events: PropTypes.array,
  incidents: PropTypes.object,
  injects: PropTypes.object,
  fetchObjectives: PropTypes.func,
  fetchAudiences: PropTypes.func,
  fetchEvents: PropTypes.func,
  fetchIncidents: PropTypes.func,
  fetchAllInjects: PropTypes.func,
}

const filterObjectives = (objectives, exerciseId) => {
  let objectivesFilterAndSorting = R.pipe(
    R.values,
    R.filter(n => n.objective_exercise.exercise_id === exerciseId),
    R.sort((a, b) => a.objective_priority > b.objective_priority)
  )
  return objectivesFilterAndSorting(objectives)
}

const filterAudiences = (audiences, exerciseId) => {
  let audiencesFilterAndSorting = R.pipe(
    R.values,
    R.filter(n => n.audience_exercise.exercise_id === exerciseId),
    R.sort((a, b) => a.audience_name.localeCompare(b.audience_name))
  )
  return audiencesFilterAndSorting(audiences)
}

const filterEvents = (events, exerciseId) => {
  let eventsFilterAndSorting = R.pipe(
    R.values,
    R.filter(n => n.event_exercise.exercise_id === exerciseId),
    R.sort((a, b) => a.inject_date > b.inject_date)
  )
  return eventsFilterAndSorting(events)
}

const select = (state, ownProps) => {
  let exerciseId = ownProps.params.exerciseId
  let objectives = filterObjectives(state.referential.entities.objectives, exerciseId)
  let audiences = filterAudiences(state.referential.entities.audiences, exerciseId)
  let events = filterEvents(state.referential.entities.events, exerciseId)

  return {
    exerciseId,
    objectives,
    audiences,
    events,
    incidents: state.referential.entities.incidents,
    injects: state.referential.entities.injects
  }
}

export default connect(select, {
  fetchObjectives,
  fetchAudiences,
  fetchEvents,
  fetchIncidents,
  fetchAllInjects
})(IndexExercise)