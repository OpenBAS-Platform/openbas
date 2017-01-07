import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import R from 'ramda'
import {injectIntl} from 'react-intl'
import * as Constants from '../../../constants/ComponentTypes'
import Theme from '../../../components/Theme'
import {T} from '../../../components/I18n'
import {i18nRegister} from '../../../utils/Messages'
import {dateFormat} from '../../../utils/Time'
import {List} from '../../../components/List'
import {Dialog} from '../../../components/Dialog'
import {MainListItem, SecondaryListItem, TertiaryListItem} from '../../../components/list/ListItem';
import {Icon} from '../../../components/Icon'
import {IconButton, FlatButton} from '../../../components/Button'
import {Avatar} from '../../../components/Avatar'
import {fetchObjectives} from '../../../actions/Objective'
import {fetchSubobjectives} from '../../../actions/Subobjective'
import {fetchAudiences} from '../../../actions/Audience'
import {fetchEvents} from '../../../actions/Event'
import {fetchIncidents, fetchIncidentTypes} from '../../../actions/Incident'
import {fetchAllInjects} from '../../../actions/Inject'
import EventView from './scenario/event/EventView'
import IncidentView from './scenario/event/IncidentView'
import InjectView from './scenario/event/InjectView'
import AudienceView from './audience/AudienceView'
import ObjectiveView from './objective/ObjectiveView'
import AudiencePopover from './AudiencePopover'

i18nRegister({
  fr: {
    'Main objectives': 'Objectifs principaux',
    'Audiences': 'Audiences',
    'players': 'joueurs',
    'You do not have any objectives in this exercise.': 'Vous n\'avez aucun objectif dans cet exercice.',
    'You do not have any audiences in this exercise.': 'Vous n\'avez aucune audience dans cet exercice.',
    'Scenario': 'Scénario',
    'You do not have any events in this exercise.': 'Vous n\'avez aucun événement dans cet exercice.',
    'Inject view': 'Vue de l\'inject',
    'Incident view': 'Vue de l\'incident',
    'Objective view': 'Vue de l\'objectif',
    'Audience view': 'Vue de l\'audience',
    'Event view': 'Vue de l\'événement'
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
  },
  'audiences': {
    position: 'absolute',
    right: '5px',
    top: '15px'
  },
  'subobjectives': {
    position: 'absolute',
    right: '50px',
    top: '15px'
  }
}

class IndexExercise extends Component {
  constructor(props) {
    super(props);
    this.state = {
      openViewEvent: false,
      currentEvent: {},
      openViewIncident: false,
      currentIncident: {},
      openViewInject: false,
      currentInject: {},
      openViewAudience: false,
      currentAudience: {},
      openViewObjective: false,
      currentObjective: {}
    }
  }

  componentDidMount() {
    this.props.fetchIncidentTypes()
    this.props.fetchObjectives(this.props.exerciseId)
    this.props.fetchSubobjectives(this.props.exerciseId)
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

  switchColor(disabled) {
    if (disabled) {
      return Theme.palette.disabledColor
    } else {
      return Theme.palette.textColor
    }
  }

  handleOpenViewEvent(event) {
    this.setState({currentEvent: event, openViewEvent: true})
  }

  handleCloseViewEvent() {
    this.setState({openViewEvent: false})
  }

  handleOpenViewIncident(incident) {
    this.setState({currentIncident: incident, openViewIncident: true})
  }

  handleCloseViewIncident() {
    this.setState({openViewIncident: false})
  }

  handleOpenViewInject(inject) {
    this.setState({currentInject: inject, openViewInject: true})
  }

  handleCloseViewInject() {
    this.setState({openViewInject: false})
  }

  handleOpenViewAudience(audience) {
    this.setState({currentAudience: audience, openViewAudience: true})
  }

  handleCloseViewAudience() {
    this.setState({openViewAudience: false})
  }

  handleOpenViewObjective(objective) {
    this.setState({currentObjective: objective, openViewObjective: true})
  }

  handleCloseViewObjective() {
    this.setState({openViewObjective: false})
  }

  render() {
    const viewEventActions = [
      <FlatButton label="Close" primary={true} onTouchTap={this.handleCloseViewEvent.bind(this)}/>,
    ]
    const viewIncidentActions = [
      <FlatButton label="Close" primary={true} onTouchTap={this.handleCloseViewIncident.bind(this)}/>,
    ]
    const viewInjectActions = [
      <FlatButton label="Close" primary={true} onTouchTap={this.handleCloseViewInject.bind(this)}/>,
    ]
    const viewAudienceActions = [
      <FlatButton label="Close" primary={true} onTouchTap={this.handleCloseViewAudience.bind(this)}/>,
    ]
    const viewObjectiveActions = [
      <FlatButton label="Close" primary={true} onTouchTap={this.handleCloseViewObjective.bind(this)}/>,
    ]
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
                  onClick={this.handleOpenViewObjective.bind(this, objective)}
                  primaryText={objective.objective_title}
                  secondaryText={objective.objective_description}
                  leftIcon={<Icon name={Constants.ICON_NAME_IMAGE_CENTER_FOCUS_STRONG}/>}
                />
              )
            })}
          </List>
          <Dialog
            title="Objective view"
            modal={false}
            open={this.state.openViewObjective}
            autoScrollBodyContent={true}
            onRequestClose={this.handleCloseViewObjective.bind(this)}
            actions={viewObjectiveActions}>
            <ObjectiveView objective={this.state.currentObjective}/>
          </Dialog>
        </div>
        <div style={styles.columnRight}>
          <div style={styles.title}>Audiences</div>
          <div className="clearfix"></div>
          {this.props.audiences.length === 0 ?
            <div style={styles.empty}><T>You do not have any audiences in this exercise.</T></div> : ""}
          <List>
            {this.props.audiences.map(audience => {
              var playersText = audience.audience_users.length + ' ' + this.props.intl.formatMessage({id: 'players'});
              return (
                <MainListItem
                  rightIconButton={<AudiencePopover exerciseId={this.props.exerciseId} audience={audience}/>}
                  key={audience.audience_id}
                  onClick={this.handleOpenViewAudience.bind(this, audience)}
                  primaryText={<div
                    style={{color: this.switchColor(!audience.audience_enabled)}}>{audience.audience_name}</div>}
                  secondaryText={<div
                    style={{color: this.switchColor(!audience.audience_enabled)}}>{playersText}</div>}
                  leftIcon={<Icon name={Constants.ICON_NAME_SOCIAL_GROUP}
                                  color={this.switchColor(!audience.audience_enabled)}/>}
                />
              )
            })}
          </List>
          <Dialog
            title="Audience view"
            modal={false}
            open={this.state.openViewAudience}
            autoScrollBodyContent={true}
            onRequestClose={this.handleCloseViewAudience.bind(this)}
            actions={viewAudienceActions}>
            <AudienceView audience={this.state.currentAudience}/>
          </Dialog>
        </div>
        <div className="clearfix"></div>
        <br /><br />
        <div style={styles.title}><T>Scenario</T></div>
        <div className="clearfix"></div>
        {this.props.events.length === 0 ?
          <div style={styles.empty}><T>You do not have any events in this exercise.</T></div> : ""}
        <List>
          {this.props.events.map(event => {
            const incidents = R.pipe(
              R.map(data => R.pathOr({incident_title: ''}, ['incidents', data.incident_id], this.props)),
              R.sort((a, b) => a.incident_title.localeCompare(b.incident_title))
            )(event.event_incidents)

            let nestedItems = incidents.map(incident => {
                let incident_id = R.propOr(Math.random(), 'incident_id', incident)
                let incident_title = R.propOr('-', 'incident_title', incident)
                let incident_story = R.propOr('-', 'incident_story', incident)
                let incident_injects = R.propOr([], 'incident_injects', incident)
                let incident_subobjectives = R.propOr([], 'incident_subobjectives', incident)

                const injects = R.pipe(
                  R.map(data => R.pathOr({}, ['injects', data.inject_id], this.props)),
                  R.sort((a, b) => a.inject_date > b.inject_date)
                )(incident_injects)

                let nestedItems2 = injects.map(inject => {
                    let inject_id = R.propOr(Math.random(), 'inject_id', inject)
                    let inject_title = R.propOr('-', 'inject_title', inject)
                    let inject_type = R.propOr('-', 'inject_type', inject)
                    let inject_date = R.propOr('-', 'inject_date', inject)
                    let inject_audiences = R.propOr([], 'inject_audiences', inject)

                    return <TertiaryListItem
                      key={inject_id}
                      onClick={this.handleOpenViewInject.bind(this, inject)}
                      leftIcon={this.selectIcon(inject_type)}
                      primaryText={<div>
                        {inject_title}
                        {<div style={styles.audiences}>
                          {inject_audiences.map(data3 => {
                            let audience = R.find(a => a.audience_id === data3.audience_id)(this.props.audiences)
                            let audience_id = R.propOr(data3.audience_id, 'audience_id', audience)
                            let audience_name = R.propOr('-', 'audience_name', audience)
                            return <IconButton key={audience_id} type={Constants.BUTTON_TYPE_SINGLE} tooltip={audience_name}
                                               tooltipPosition="bottom-left">
                              <Avatar icon={<Icon name={Constants.ICON_NAME_SOCIAL_GROUP}/>} size={32}/></IconButton>
                          })}
                        </div>}
                      </div>}
                      secondaryText={dateFormat(inject_date)}
                    />
                  }
                )
                return <SecondaryListItem
                  key={incident_id}
                  onClick={this.handleOpenViewIncident.bind(this, incident)}
                  leftIcon={<Icon name={Constants.ICON_NAME_MAPS_LAYERS}/>}
                  primaryText={<div>
                    {incident_title}
                    {<div style={styles.subobjectives}>
                      {incident_subobjectives.map(data4 => {
                        let subobjective = R.propOr({}, data4.subobjective_id, this.props.subobjectives)
                        let subobjective_id = R.propOr(data4.subobjective_id, 'subobjective_id', subobjective)
                        let subobjective_title = R.propOr('-', 'subobjective_title', subobjective)
                        return <IconButton key={subobjective_id} type={Constants.BUTTON_TYPE_SINGLE}
                                           tooltip={subobjective_title}
                                           tooltipPosition="bottom-left">
                          <Avatar icon={<Icon name={Constants.ICON_NAME_IMAGE_CENTER_FOCUS_WEAK}/>}
                                  size={32}/></IconButton>
                      })}
                    </div>}
                  </div>}
                  secondaryText={incident_story}
                  nestedItems={nestedItems2}/>
              }
            )

            return (
              <MainListItem
                key={event.event_id}
                onClick={this.handleOpenViewEvent.bind(this, event)}
                leftIcon={<Icon name={Constants.ICON_NAME_ACTION_EVENT}/>}
                primaryText={event.event_title}
                secondaryText={event.event_description}
                nestedItems={nestedItems}
              />
            )
          })}
        </List>
        <Dialog
          title="Event view"
          modal={false}
          open={this.state.openViewEvent}
          autoScrollBodyContent={true}
          onRequestClose={this.handleCloseViewEvent.bind(this)}
          actions={viewEventActions}>
          <EventView event={this.state.currentEvent}/>
        </Dialog>
        <Dialog
          title="Incident view"
          modal={false}
          open={this.state.openViewIncident}
          autoScrollBodyContent={true}
          onRequestClose={this.handleCloseViewIncident.bind(this)}
          actions={viewIncidentActions}>
          <IncidentView incident={this.state.currentIncident} incident_types={this.props.incident_types}/>
        </Dialog>
        <Dialog
          title="Inject view"
          modal={false}
          open={this.state.openViewInject}
          autoScrollBodyContent={true}
          onRequestClose={this.handleCloseViewInject.bind(this)}
          actions={viewInjectActions}>
          <InjectView inject={this.state.currentInject}/>
        </Dialog>
      </div>
    )
  }
}

IndexExercise.propTypes = {
  exerciseId: PropTypes.string,
  objectives: PropTypes.array,
  subobjectives: PropTypes.object,
  audiences: PropTypes.array,
  events: PropTypes.array,
  incidents: PropTypes.object,
  incident_types: PropTypes.object,
  injects: PropTypes.object,
  fetchObjectives: PropTypes.func,
  fetchSubobjectives: PropTypes.func,
  fetchAudiences: PropTypes.func,
  fetchEvents: PropTypes.func,
  fetchIncidents: PropTypes.func,
  fetchAllInjects: PropTypes.func,
  fetchIncidentTypes: PropTypes.func,
  intl: PropTypes.object
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
    R.sort((a, b) => a.event_title.localeCompare(b.event_title))
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
    subobjectives: state.referential.entities.subobjectives,
    incidents: state.referential.entities.incidents,
    incident_types: state.referential.entities.incident_types,
    injects: state.referential.entities.injects
  }
}

export default connect(select, {
  fetchObjectives,
  fetchSubobjectives,
  fetchAudiences,
  fetchEvents,
  fetchIncidents,
  fetchIncidentTypes,
  fetchAllInjects
})(injectIntl(IndexExercise))
