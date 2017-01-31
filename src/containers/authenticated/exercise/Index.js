import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import R from 'ramda'
import {injectIntl} from 'react-intl'
import * as Constants from '../../../constants/ComponentTypes'
import Theme from '../../../components/Theme'
import {T} from '../../../components/I18n'
import {i18nRegister} from '../../../utils/Messages'
import {dateFormat, timeDiff} from '../../../utils/Time'
import {List as ComponentList} from '../../../components/List'
import {Dialog} from '../../../components/Dialog'
import {MainListItem, SecondaryListItem, TertiaryListItem, MainSmallListItem} from '../../../components/list/ListItem'
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
import AudienceView from './audiences/audience/AudienceView'
import ObjectiveView from './objective/ObjectiveView'
import AudiencePopover from './AudiencePopover'
import AudiencesPopover from './AudiencesPopover'
import ScenarioPopover from './ScenarioPopover'
import {List as VList, AutoSizer} from 'react-virtualized'

i18nRegister({
  fr: {
    'Main objectives': 'Objectifs principaux',
    'Audiences': 'Audiences',
    'players': 'joueurs',
    'You do not have any objectives in this exercise.': 'Vous n\'avez aucun objectif dans cet exercice.',
    'You do not have any audiences in this exercise.': 'Vous n\'avez aucune audience dans cet exercice.',
    'Scenario': 'Scénario',
    'You do not have any events in this exercise.': 'Vous n\'avez aucun événement dans cet exercice.',
    'Inject view': 'Vue de l\'injection',
    'Incident view': 'Vue de l\'incident',
    'Objective view': 'Vue de l\'objectif',
    'Audience view': 'Vue de l\'audience',
    'Event view': 'Vue de l\'événement',
    'View all': 'Voir tout',
    'Audiences of the inject': 'Audiences de l\'injection'
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
    height: '35px',
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
  },
  'expand': {
    height: '25px',
    paddingTop: '3px',
    backgroundColor: '#F0F0F0',
    cursor: 'pointer',
    textAlign: 'center',
    borderRadius: '5px'
  },
  'more': {
    float: 'left',
    margin: '12px 0px 0px 5px'
  },
  'expendable': {
    float: 'right',
    margin: '10px 0px 0px 0px'
  }
}

class IndexExercise extends Component {
  constructor(props) {
    super(props);
    this.state = {
      extendedElements: [],
      openViewEvent: false,
      currentEvent: {},
      openViewIncident: false,
      currentIncident: {},
      openViewInject: false,
      currentInject: {},
      openViewAudience: false,
      currentAudience: {},
      openViewObjective: false,
      currentObjective: {},
      openObjectives: false,
      openAudiences: false,
      currentInjectAudiences: [],
      openInjectAudiences: false,
      computedVisibleHeight: 0
    }
  }

   updateDimensions() {
     this.setState({computedVisibleHeight: window.innerHeight - 64 - 20});
   }

  componentDidMount() {
    window.addEventListener("resize", this.updateDimensions.bind(this))
    this.updateDimensions()
    this.props.fetchIncidentTypes()
    this.props.fetchObjectives(this.props.exerciseId)
    this.props.fetchSubobjectives(this.props.exerciseId)
    this.props.fetchAudiences(this.props.exerciseId)
    this.props.fetchEvents(this.props.exerciseId)
    this.props.fetchIncidents(this.props.exerciseId)
    this.props.fetchAllInjects(this.props.exerciseId)
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions)
  }

  selectIcon(type) {
    switch (type) {
      case 'email':
        return <Icon name={Constants.ICON_NAME_CONTENT_MAIL} type={Constants.ICON_TYPE_MAINLIST}/>
      case 'ovh-sms':
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

  handleExtendLine(event_id, event) {
    event.stopPropagation()
    const isOpen = R.contains(event_id, this.state.extendedElements)
    const extendedList = isOpen ? R.filter(e => e !== event_id, this.state.extendedElements) :
      R.append(event_id, this.state.extendedElements)
    this.setState({extendedElements: extendedList})
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

  handleOpenObjectives() {
    this.setState({openObjectives: true})
  }

  handleCloseObjectives() {
    this.setState({openObjectives: false})
  }

  handleOpenAudiences() {
    this.setState({openAudiences: true})
  }

  handleCloseAudiences() {
    this.setState({openAudiences: false})
  }

  handleOpenInjectAudiences(audiences, event) {
    event.stopPropagation()
    this.setState({currentInjectAudiences: audiences, openInjectAudiences: true})
  }

  handleCloseInjectAudiences() {
    this.setState({openInjectAudiences: false})
  }

  renderExtendCollapseButton(id) {
    const isOpen = R.contains(id, this.state.extendedElements)
    return <div onClick={this.handleExtendLine.bind(this, id)} style={styles.expendable}>
      <Icon
        name={isOpen ? Constants.ICON_NAME_HARDWARE_KEYBOARD_ARROW_UP : Constants.ICON_NAME_HARDWARE_KEYBOARD_ARROW_DOWN}/>
    </div>
  }

  renderEvent(key, className, style, event) {
    return <div key={key} className={className} style={style}>
      <MainListItem
        key={event.event_id}
        onClick={this.handleOpenViewEvent.bind(this, event)}
        leftIcon={<Icon name={Constants.ICON_NAME_ACTION_EVENT}/>}
        primaryText={<div>{event.event_title}{this.renderExtendCollapseButton(event.event_id)}</div>}
        secondaryText={event.event_description}
      />
    </div>
  }

  renderIncident(key, className, style, incident) {
    let incident_id = R.propOr(Math.random(), 'incident_id', incident)
    let incident_title = R.propOr('-', 'incident_title', incident)
    let incident_story = R.propOr('-', 'incident_story', incident)
    let incident_subobjectives = R.propOr([], 'incident_subobjectives', incident)
    return <div key={key} className={className} style={style}>
      <SecondaryListItem
        key={incident_id}
        onClick={this.handleOpenViewIncident.bind(this, incident)}
        leftIcon={<Icon name={Constants.ICON_NAME_MAPS_LAYERS}/>}
        primaryText={<div>
          {incident_title}
          {<div style={styles.subobjectives}>
            {incident_subobjectives.map(sub => {
              let subobjective = R.propOr({}, sub.subobjective_id, this.props.subobjectives)
              let subobjective_id = R.propOr(sub.subobjective_id, 'subobjective_id', subobjective)
              let subobjective_title = R.propOr('-', 'subobjective_title', subobjective)
              return <IconButton key={subobjective_id} type={Constants.BUTTON_TYPE_SINGLE} tooltip={subobjective_title}
                                 tooltipPosition="bottom-left">
                <Avatar icon={<Icon name={Constants.ICON_NAME_IMAGE_CENTER_FOCUS_WEAK}/>} size={32}/></IconButton>
            })}
          </div>}
          {this.renderExtendCollapseButton(incident_id)}
        </div>}
        secondaryText={incident_story}/>
    </div>
  }

  renderInject(key, className, style, inject) {
    let inject_id = R.propOr(Math.random(), 'inject_id', inject)
    let inject_title = R.propOr('-', 'inject_title', inject)
    let inject_type = R.propOr('-', 'inject_type', inject)
    let inject_date = R.propOr(undefined, 'inject_date', inject)
    let inject_audiences = R.propOr([], 'inject_audiences', inject)
    return <div key={key} className={className} style={style}>
      <TertiaryListItem
        key={inject_id}
        onClick={this.handleOpenViewInject.bind(this, inject)}
        leftIcon={this.selectIcon(inject_type)}
        primaryText={<div>
          {inject_title}
          {<div style={styles.audiences}>
            {R.take(4, inject_audiences).map(data3 => {
              let audience = R.find(a => a.audience_id === data3.audience_id)(this.props.audiences)
              let audience_id = R.propOr(data3.audience_id, 'audience_id', audience)
              let audience_name = R.propOr('-', 'audience_name', audience)
              return <IconButton key={audience_id} type={Constants.BUTTON_TYPE_SINGLE} tooltip={audience_name}
                                 tooltipPosition="bottom-left">
                <Avatar icon={<Icon name={Constants.ICON_NAME_SOCIAL_GROUP}/>} size={32}/></IconButton>
            })}
            {inject_audiences.length > 4 ?
              <div onClick={this.handleOpenInjectAudiences.bind(this, inject_audiences)} style={styles.more}>
                <Icon name={Constants.ICON_NAME_NAVIGATION_MORE_HORIZ}/></div> : ""}
          </div>}
        </div>}
        secondaryText={dateFormat(inject_date)}
      />
    </div>
  }

  render() {
    const viewEventActions =
      [<FlatButton label="Close" primary={true} onTouchTap={this.handleCloseViewEvent.bind(this)}/>]
    const viewIncidentActions =
      [<FlatButton label="Close" primary={true} onTouchTap={this.handleCloseViewIncident.bind(this)}/>]
    const viewInjectActions =
      [<FlatButton label="Close" primary={true} onTouchTap={this.handleCloseViewInject.bind(this)}/>]
    const viewAudienceActions =
      [<FlatButton label="Close" primary={true} onTouchTap={this.handleCloseViewAudience.bind(this)}/>]
    const viewObjectiveActions =
      [<FlatButton label="Close" primary={true} onTouchTap={this.handleCloseViewObjective.bind(this)}/>]
    const audiencesActions =
      [<FlatButton label="Close" primary={true} onTouchTap={this.handleCloseAudiences.bind(this)}/>]
    const objectivesActions =
      [<FlatButton label="Close" primary={true} onTouchTap={this.handleCloseObjectives.bind(this)}/>]
    const injectAudiencesActions =
      [<FlatButton label="Close" primary={true} onTouchTap={this.handleCloseInjectAudiences.bind(this)}/>]

    //Build a flatten list of elements
    const eventsIncidentsInjects = R.flatten(
      R.map(event => {
        const incidents = R.pipe(
          R.map(data => R.pathOr({incident_title: ''}, ['incidents', data.incident_id], this.props)),
          R.filter(data => R.contains(event.event_id, this.state.extendedElements)),
          R.sort((a, b) => a.incident_order > b.incident_order),
          R.map(data => {
            let incident_injects = R.propOr([], 'incident_injects', data)
            const injects = R.pipe(
              R.map(data => R.pathOr({}, ['injects', data.inject_id], this.props)),
              R.filter(data => R.contains(data.inject_incident.incident_id, this.state.extendedElements)),
              R.sort((a, b) => timeDiff(a.inject_date, b.inject_date)),
              R.map(data => {
                return {type: 'inject', data}
              })
            )(incident_injects)
            return [{type: 'incident', data}, injects]
          })
        )(event.event_incidents)
        return [{type: 'event', data: event}, incidents]
      }, this.props.events)
    )

    //Define the virtual rendering
    const rowRenderer = ({index, key, style}) => {
      const element = eventsIncidentsInjects[index]
      switch (element.type) {
        case 'event':
          return this.renderEvent(key, "", style, element.data)
        case 'incident':
          return this.renderIncident(key, "", style, element.data)
        case 'inject':
          return this.renderInject(key, "", style, element.data)
        default:
          return <div></div>
      }
    }

    return (
      <div>
        <div style={styles.columnLeft}>
          <div style={styles.title}><T>Main objectives</T></div>
          <div className="clearfix"></div>
          {this.props.objectives.length === 0 ?
            <div style={styles.empty}><T>You do not have any objectives in this exercise.</T></div> : ""}
          <ComponentList>
            {R.take(3, this.props.objectives).map(objective => {
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
          </ComponentList>
          {this.props.objectives.length > 3 ?
            <div onClick={this.handleOpenObjectives.bind(this)} style={styles.expand}><Icon
              name={Constants.ICON_NAME_HARDWARE_KEYBOARD_ARROW_DOWN}/></div> : ""}
          <Dialog
            title="Main objectives"
            modal={false}
            open={this.state.openObjectives}
            autoScrollBodyContent={true}
            onRequestClose={this.handleCloseAudiences.bind(this)}
            actions={objectivesActions}>
            <ComponentList>
              {this.props.objectives.map(objective => {
                return (
                  <MainSmallListItem
                    key={objective.objective_id}
                    onClick={this.handleOpenViewObjective.bind(this, objective)}
                    primaryText={objective.objective_title}
                    secondaryText={objective.objective_description}
                    leftIcon={<Icon name={Constants.ICON_NAME_IMAGE_CENTER_FOCUS_STRONG}/>}
                  />
                )
              })}
            </ComponentList>
          </Dialog>
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
          <AudiencesPopover exerciseId={this.props.exerciseId}/>
          <div className="clearfix"></div>
          {this.props.audiences.length === 0 ?
            <div style={styles.empty}><T>You do not have any audiences in this exercise.</T></div> : ""}
          <ComponentList>
            {R.take(3, this.props.audiences).map(audience => {
              let playersText = audience.audience_users_number + ' ' + this.props.intl.formatMessage({id: 'players'});
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
          </ComponentList>
          {this.props.audiences.length > 3 ?
            <div onClick={this.handleOpenAudiences.bind(this)} style={styles.expand}><Icon
              name={Constants.ICON_NAME_HARDWARE_KEYBOARD_ARROW_DOWN}/></div> : ""}
          <Dialog
            title="Audiences"
            modal={false}
            open={this.state.openAudiences}
            autoScrollBodyContent={true}
            onRequestClose={this.handleCloseAudiences.bind(this)}
            actions={audiencesActions}>
            <ComponentList>
              {this.props.audiences.map(audience => {
                let playersText = audience.audience_users_number + ' ' + this.props.intl.formatMessage({id: 'players'});
                return (
                  <MainSmallListItem
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
            </ComponentList>
          </Dialog>
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
        <ScenarioPopover exerciseId={this.props.exerciseId} injects={this.props.injects}/>
        <div className="clearfix"></div>
        {this.props.events.length === 0 ?
          <div style={styles.empty}><T>You do not have any events in this exercise.</T></div> : ""
        }
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
        <Dialog
          title="Audiences of the inject"
          modal={false}
          open={this.state.openInjectAudiences}
          autoScrollBodyContent={true}
          onRequestClose={this.handleCloseInjectAudiences.bind(this)}
          actions={injectAudiencesActions}>
          <ComponentList>
            {this.state.currentInjectAudiences.map(data => {
              let audience = R.find(a => a.audience_id === data.audience_id)(this.props.audiences)
              let audience_id = R.propOr(data.audience_id, 'audience_id', audience)
              let audience_name = R.propOr('-', 'audience_name', audience)
              let audience_users = R.propOr([], 'audience_users', audience)
              let playersText = audience_users.length + ' ' + this.props.intl.formatMessage({id: 'players'});

              return (
                <MainSmallListItem
                  key={audience_id}
                  onClick={this.handleOpenViewAudience.bind(this, audience)}
                  primaryText={<div
                    style={{color: this.switchColor(!audience.audience_enabled)}}>{audience_name}</div>}
                  secondaryText={<div
                    style={{color: this.switchColor(!audience.audience_enabled)}}>{playersText}</div>}
                  leftIcon={<Icon name={Constants.ICON_NAME_SOCIAL_GROUP}
                                  color={this.switchColor(!audience.audience_enabled)}/>}
                />
              )
            })}
          </ComponentList>
        </Dialog>
        <AutoSizer>
          {({width, height}) => (
            <VList
              height={this.state.computedVisibleHeight - height}
              rowCount={R.length(eventsIncidentsInjects)}
              rowHeight={77}
              rowRenderer={rowRenderer}
              width={width}
            />
          )}
        </AutoSizer>
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
    R.sort((a, b) => a.objective_priority > b.objective_priority),
  )
  return objectivesFilterAndSorting(objectives)
}

const filterAudiences = (audiences, exerciseId) => {
  let audiencesFilterAndSorting = R.pipe(
    R.values,
    R.filter(n => n.audience_exercise.exercise_id === exerciseId),
    R.sort((a, b) => a.audience_name.localeCompare(b.audience_name)),
  )
  return audiencesFilterAndSorting(audiences)
}

const filterEvents = (events, exerciseId) => {
  let eventsFilterAndSorting = R.pipe(
    R.values,
    R.filter(n => n.event_exercise.exercise_id === exerciseId),
    R.sort((a, b) => a.event_order > b.event_order)
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
