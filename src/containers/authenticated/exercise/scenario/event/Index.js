import React, {Component, PropTypes} from 'react'
import R from 'ramda'
import {dateFormat} from '../../../../../utils/Time'
import {connect} from 'react-redux'
import {i18nRegister} from '../../../../../utils/Messages'
import {T} from '../../../../../components/I18n'
import {Toolbar, ToolbarTitle} from '../../../../../components/Toolbar'
import {List} from '../../../../../components/List'
import {MainListItem, HeaderItem} from '../../../../../components/list/ListItem';
import {Icon} from '../../../../../components/Icon'
import {SearchField} from '../../../../../components/SimpleTextField'
import {fetchAudiences} from '../../../../../actions/Audience'
import {fetchEvents} from '../../../../../actions/Event'
import {fetchIncidentTypes, fetchIncidents} from '../../../../../actions/Incident'
import {fetchInjectTypes, fetchInjects} from '../../../../../actions/Inject'
import * as Constants from '../../../../../constants/ComponentTypes';
import IncidentNav from './IncidentNav'
import EventPopover from './EventPopover'
import IncidentPopover from './IncidentPopover'
import CreateInject from './CreateInject'
import InjectPopover from './InjectPopover'

const styles = {
  'container': {
    paddingRight: '300px',
  },
  'header': {
    'icon': {
      fontSize: '12px',
      textTransform: 'uppercase',
      fontWeight: '700',
      padding: '8px 0 0 8px'
    },
    'inject_title': {
      float: 'left',
      width: '50%',
      fontSize: '12px',
      textTransform: 'uppercase',
      fontWeight: '700'
    },
    'inject_date': {
      float: 'left',
      width: '20%',
      fontSize: '12px',
      textTransform: 'uppercase',
      fontWeight: '700'
    },
    'inject_user': {
      float: 'left',
      width: '20%',
      fontSize: '12px',
      textTransform: 'uppercase',
      fontWeight: '700'
    }
  },
  'title': {
    float: 'left',
    fontSize: '13px',
    textTransform: 'uppercase'
  },
  'empty': {
    marginTop: 30,
    fontSize: '18px',
    fontWeight: 500,
    textAlign: 'center'
  },
  'search': {
    float: 'right',
  },
  'inject_title': {
    float: 'left',
    width: '50%',
    padding: '5px 0 0 0'
  },
  'inject_date': {
    float: 'left',
    width: '20%',
    padding: '5px 0 0 0'
  },
  'inject_user': {
    float: 'left',
    padding: '5px 0 0 0'
  }
}

i18nRegister({
  fr: {
    'This event is empty.': 'Cet événement est vide.',
    'This incident is empty.': 'Cet incident est vide.',
    'Title': 'Titre',
    'Date': 'Date',
    'Author': 'Auteur'
  }
})

class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {sortBy: 'inject_date', orderAsc: true, searchTerm: ''}
  }

  componentDidMount() {
    this.props.fetchAudiences(this.props.exerciseId)
    this.props.fetchEvents(this.props.exerciseId)
    this.props.fetchIncidentTypes()
    this.props.fetchIncidents(this.props.exerciseId)
    this.props.fetchInjectTypes()
    this.props.fetchInjects(this.props.exerciseId, this.props.eventId)
  }

  handleSearchInjects(event, value) {
    this.setState({searchTerm: value})
  }

  reverseBy(field) {
    this.setState({sortBy: field, orderAsc: !this.state.orderAsc})
  }

  SortHeader(field, label) {
    var icon = this.state.orderAsc ? Constants.ICON_NAME_NAVIGATION_ARROW_DROP_DOWN
      : Constants.ICON_NAME_NAVIGATION_ARROW_DROP_UP
    const IconDisplay = this.state.sortBy === field ? <Icon type={Constants.ICON_TYPE_SORT} name={icon}/> : ""
    return <div style={styles.header[field]} onClick={this.reverseBy.bind(this, field)}>
      <T>{label}</T> {IconDisplay}
    </div>
  }

  //TODO replace with sortWith after Ramdajs new release
  ascend(a, b) {
    return a < b ? -1 : a > b ? 1 : 0;
  }

  descend(a, b) {
    return a > b ? -1 : a < b ? 1 : 0;
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
    let {exerciseId, eventId, event, incident, incidents} = this.props
    let event_title = R.propOr('-', 'event_title', event)
    if (event && incident) {
      const keyword = this.state.searchTerm
      let filterByKeyword = n => keyword === '' ||
      n.inject_title.toLowerCase().indexOf(keyword.toLowerCase()) !== -1 ||
      n.inject_description.toLowerCase().indexOf(keyword.toLowerCase()) !== -1 ||
      n.inject_content.toLowerCase().indexOf(keyword.toLowerCase()) !== -1

      const injects = R.pipe(
        R.map(data => R.pathOr({}, ['injects', data.inject_id], this.props)),
        R.filter(filterByKeyword),
        R.sort((a, b) => { //TODO replace with sortWith after Ramdajs new release
          let fieldA = R.toLower(R.propOr('', this.state.sortBy, a))
          let fieldB = R.toLower(R.propOr('', this.state.sortBy, b))
          return this.state.orderAsc ? this.ascend(fieldA, fieldB) : this.descend(fieldA, fieldB)
        })
      )(incident.incident_injects)
      //Display the component
      return <div style={styles.container}>
        <IncidentNav selectedIncident={incident.incident_id} exerciseId={exerciseId} eventId={eventId}
                     incidents={incidents} incident_types={this.props.incident_types}/>
        <div>
          <div style={styles.title}>{incident.incident_title}</div>
          <IncidentPopover exerciseId={exerciseId} eventId={eventId} incident={incident} incidentSubobjectivesIds={incident.incident_subobjectives.map(i => i.subobjective_id)}
                           incident_types={this.props.incident_types}/>
          <div style={styles.search}>
            <SearchField name="keyword" fullWidth={true} type="text" hintText="Search"
                         onChange={this.handleSearchInjects.bind(this)}
                         styletype={Constants.FIELD_TYPE_RIGHT} />
          </div>
          <div className="clearfix"></div>

          <List>
            {incident.incident_injects.length === 0 ? (
                <div style={styles.empty}><T>This incident is empty.</T></div>
            ) : (
              <HeaderItem leftIcon={<span style={styles.header.icon}>#</span>}
                          rightIconButton={<Icon style={{display: 'none'}}/>} primaryText={<div>
                {this.SortHeader('inject_title', 'Title')}
                {this.SortHeader('inject_date', 'Date')}
                {this.SortHeader('inject_user', 'Author')}
                <div className="clearfix"></div>
              </div>}
              />
            )}

            {injects.map(inject => {
              //Setup variables
              let injectId = R.propOr(Math.random(), 'inject_id', inject)
              let inject_title = R.propOr('-', 'inject_title', inject)
              let inject_user = R.propOr('-', 'inject_user', inject)
              let inject_date = R.prop('inject_date', inject)
              let inject_type = R.propOr('-', 'inject_type', inject)
              let inject_audiences = R.propOr([], 'inject_audiences', inject)
              //Return the dom
              return <MainListItem
                key={injectId}
                leftIcon={this.selectIcon(inject_type)}
                rightIconButton={
                  <InjectPopover
                    exerciseId={exerciseId}
                    eventId={eventId}
                    incidentId={incident.incident_id}
                    inject={inject}
                    injectAudiencesIds={inject_audiences.map(a => a.audience_id)}
                    audiences={this.props.audiences}
                    inject_types={this.props.inject_types}
                  />
                }
                primaryText={
                  <div>
                    <div style={styles.inject_title}>{inject_title}</div>
                    <div style={styles.inject_date}>{dateFormat(inject_date)}</div>
                    <div style={styles.inject_user}>{inject_user}</div>
                    <div className="clearfix"></div>
                  </div>
                }
              />
            })}
          </List>
          <CreateInject exerciseId={exerciseId} eventId={eventId} incidentId={incident.incident_id}
                        inject_types={this.props.inject_types} audiences={this.props.audiences}/>
          <Toolbar type={Constants.TOOLBAR_TYPE_EVENT}>
            <ToolbarTitle type={Constants.TOOLBAR_TYPE_EVENT} text={event_title}/>
            <EventPopover exerciseId={exerciseId} eventId={eventId} event={event}/>
          </Toolbar>
        </div>
      </div>
    } else if (event) {
      return <div style={styles.container}>
        <IncidentNav exerciseId={exerciseId} eventId={eventId} incidents={incidents} incident_types={this.props.incident_types}/>
        <div style={styles.empty}><T>This event is empty.</T></div>
        <Toolbar type={Constants.TOOLBAR_TYPE_EVENT}>
          <ToolbarTitle type={Constants.TOOLBAR_TYPE_EVENT} text={event_title}/>
          <EventPopover exerciseId={exerciseId} eventId={eventId} event={event}/>
        </Toolbar>
      </div>
    } else {
      return <div style={styles.container}></div>
    }
  }
}

Index.propTypes = {
  exerciseId: PropTypes.string,
  audiences: PropTypes.array,
  eventId: PropTypes.string,
  event: PropTypes.object,
  incident_types: PropTypes.object,
  incident: PropTypes.object,
  incidents: PropTypes.array,
  inject_types: PropTypes.object,
  injects: PropTypes.object,
  fetchAudiences: PropTypes.func,
  fetchEvents: PropTypes.func,
  fetchIncidentTypes: PropTypes.func,
  fetchIncidents: PropTypes.func,
  fetchInjectTypes: PropTypes.func,
  fetchInjects: PropTypes.func,
}

const filterAudiences = (audiences, exerciseId) => {
  let audiencesFilterAndSorting = R.pipe(
    R.values,
    R.filter(n => n.audience_exercise.exercise_id === exerciseId),
    R.sort((a, b) => a.audience_name.localeCompare(b.audience_name))
  )
  return audiencesFilterAndSorting(audiences)
}

const filterIncidents = (incidents, eventId) => {
  let incidentsFilterAndSorting = R.pipe(
    R.values,
    R.filter(n => n.incident_event.event_id === eventId),
    R.sort((a, b) => a.incident_title.localeCompare(b.incident_title))
  )
  return incidentsFilterAndSorting(incidents)
}

const select = (state, ownProps) => {
  let exerciseId = ownProps.params.exerciseId
  let eventId = ownProps.params.eventId
  let audiences = filterAudiences(state.referential.entities.audiences, exerciseId)
  let event = R.prop(eventId, state.referential.entities.events)
  let incidents = filterIncidents(state.referential.entities.incidents, eventId)
  //region get default incident
  let stateCurrentIncident = R.path(['exercise', exerciseId, 'event', eventId, 'current_incident'], state.screen)
  let incidentId = stateCurrentIncident === undefined && incidents.length > 0 ? R.head(incidents).incident_id : stateCurrentIncident //Force a default incident if needed
  let incident = incidentId ? R.find(a => a.incident_id === incidentId)(incidents) : undefined
  //endregion

  return {
    exerciseId,
    eventId,
    event,
    incident,
    incidents,
    audiences,
    injects: state.referential.entities.injects,
    incident_types: state.referential.entities.incident_types,
    inject_types: state.referential.entities.inject_types
  }
}

export default connect(select, {
  fetchAudiences,
  fetchEvents,
  fetchIncidentTypes,
  fetchIncidents,
  fetchInjectTypes,
  fetchInjects
})(Index);
