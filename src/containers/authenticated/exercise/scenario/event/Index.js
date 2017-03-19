import React, {Component, PropTypes} from 'react'
import R from 'ramda'
import {dateFormat} from '../../../../../utils/Time'
import {connect} from 'react-redux'
import {i18nRegister} from '../../../../../utils/Messages'
import {T} from '../../../../../components/I18n'
import Theme from '../../../../../components/Theme'
import {Toolbar, ToolbarTitle} from '../../../../../components/Toolbar'
import {Dialog} from '../../../../../components/Dialog'
import {List} from '../../../../../components/List'
import {MainListItem, HeaderItem} from '../../../../../components/list/ListItem';
import {Icon} from '../../../../../components/Icon'
import {FlatButton} from '../../../../../components/Button'
import {SearchField} from '../../../../../components/SimpleTextField'
import {fetchAudiences} from '../../../../../actions/Audience'
import {fetchSubaudiences} from '../../../../../actions/Subaudience'
import {fetchSubobjectives} from '../../../../../actions/Subobjective'
import {fetchEvents} from '../../../../../actions/Event'
import {fetchIncidentTypes, fetchIncidents} from '../../../../../actions/Incident'
import {fetchInjectTypes, fetchInjects} from '../../../../../actions/Inject'
import * as Constants from '../../../../../constants/ComponentTypes';
import IncidentNav from './IncidentNav'
import EventPopover from './EventPopover'
import IncidentPopover from './IncidentPopover'
import CreateInject from './CreateInject'
import InjectPopover from './InjectPopover'
import InjectView from './InjectView'

i18nRegister({
  fr: {
    'This event is empty.': 'Cet événement est vide.',
    'This incident is empty.': 'Cet incident est vide.',
    'Title': 'Titre',
    'Date': 'Date',
    'Author': 'Auteur',
    'linked subobjective(s)': 'sous-objectif(s) lié(s)'
  }
})

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
      width: '18%',
      fontSize: '12px',
      textTransform: 'uppercase',
      fontWeight: '700'
    },
    'inject_audiences': {
      float: 'left',
      textAlign: 'center',
      width: '2%',
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
  'subobjectives': {
    float: 'left',
    fontSize: '12px',
    color: Theme.palette.accent3Color
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
    width: '18%',
    float: 'left',
    padding: '5px 0 0 0'
  },
  'inject_audiences': {
    width: '2%',
    float: 'left',
    padding: '5px 0 0 0',
    textAlign: 'center'
  }
}

class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {sortBy: 'inject_date', orderAsc: true, searchTerm: '', openView: false, currentInject: {}}
  }

  componentDidMount() {
    this.props.fetchSubobjectives(this.props.exerciseId)
    this.props.fetchAudiences(this.props.exerciseId)
    this.props.fetchSubaudiences(this.props.exerciseId)
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

  SortHeader2(field, element) {
    var icon = this.state.orderAsc ? Constants.ICON_NAME_NAVIGATION_ARROW_DROP_DOWN
      : Constants.ICON_NAME_NAVIGATION_ARROW_DROP_UP
    const IconDisplay = this.state.sortBy === field ? <Icon type={Constants.ICON_TYPE_SORT} name={icon}/> : ""
    return <div style={styles.header[field]} onClick={this.reverseBy.bind(this, field)}>
      {element} {IconDisplay}
    </div>
  }


  //TODO replace with sortWith after Ramdajs new release
  ascend(a, b) {
    return a < b ? -1 : a > b ? 1 : 0;
  }

  descend(a, b) {
    return a > b ? -1 : a < b ? 1 : 0;
  }

  selectIcon(type, color) {
    switch (type) {
      case 'openex_email':
        return <Icon name={Constants.ICON_NAME_CONTENT_MAIL} type={Constants.ICON_TYPE_MAINLIST} color={color}/>
      case 'openex_ovh_sms':
        return <Icon name={Constants.ICON_NAME_NOTIFICATION_SMS} type={Constants.ICON_TYPE_MAINLIST} color={color}/>
      case 'openex_manual':
        return <Icon name={Constants.ICON_NAME_ACTION_INPUT} type={Constants.ICON_TYPE_MAINLIST} color={color}/>
      default:
        return <Icon name={Constants.ICON_NAME_CONTENT_MAIL} type={Constants.ICON_TYPE_MAINLIST} color={color}/>
    }
  }

  switchColor(disabled) {
    if (disabled) {
      return Theme.palette.disabledColor
    } else {
      return Theme.palette.textColor
    }
  }

  handleOpenView(inject) {
    this.setState({currentInject: inject, openView: true})
  }

  handleCloseView() {
    this.setState({openView: false})
  }

  render() {
    const viewActions = [
      <FlatButton label="Close" primary={true} onTouchTap={this.handleCloseView.bind(this)}/>,
    ]

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
          let fieldA = R.toLower(R.propOr('', this.state.sortBy, a).toString())
          let fieldB = R.toLower(R.propOr('', this.state.sortBy, b).toString())
          return this.state.orderAsc ? this.ascend(fieldA, fieldB) : this.descend(fieldA, fieldB)
        })
      )(incident.incident_injects)
      //Display the component
      return <div style={styles.container}>
        <IncidentNav selectedIncident={incident.incident_id} exerciseId={exerciseId} eventId={eventId}
                     incidents={incidents} incident_types={this.props.incident_types} subobjectives={this.props.subobjectives}/>
        <div>
          <div style={styles.title}>{incident.incident_title}</div>
          <IncidentPopover exerciseId={exerciseId} eventId={eventId} incident={incident}
                           subobjectives={this.props.subobjectives}
                           incidentSubobjectivesIds={incident.incident_subobjectives.map(i => i.subobjective_id)}
                           incident_types={this.props.incident_types}/>
          <div style={styles.subobjectives}>{incident.incident_subobjectives.length} <T>linked subobjective(s)</T></div>
          <div style={styles.search}>
            <SearchField name="keyword" fullWidth={true} type="text" hintText="Search"
                         onChange={this.handleSearchInjects.bind(this)}
                         styletype={Constants.FIELD_TYPE_RIGHT}/>
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
                  {this.SortHeader2('inject_users_number', <Icon name={Constants.ICON_NAME_SOCIAL_GROUP}/>)}
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
              let inject_subaudiences = R.propOr([], 'inject_subaudiences', inject)
              let inject_users_number = R.propOr('-', 'inject_users_number', inject)
              let inject_enabled = R.propOr(true, 'inject_enabled', inject)
              let injectType = R.propOr(false, inject_type, this.props.inject_types)
              let injectDisabled = injectType ? false : true
              //Return the dom
              return <MainListItem
                key={injectId}
                leftIcon={this.selectIcon(inject_type, this.switchColor(!inject_enabled || injectDisabled))}
                onClick={this.handleOpenView.bind(this, inject)}
                rightIconButton={
                  <InjectPopover
                    type={Constants.INJECT_SCENARIO}
                    exerciseId={exerciseId}
                    eventId={eventId}
                    incidentId={incident.incident_id}
                    inject={inject}
                    injectAudiencesIds={inject_audiences.map(a => a.audience_id)}
                    injectSubaudiencesIds={inject_subaudiences.map(a => a.subaudience_id)}
                    audiences={this.props.audiences}
                    subaudiences={this.props.subaudiences}
                    inject_types={this.props.inject_types}
                    incidents={this.props.allIncidents}
                  />
                }
                primaryText={
                  <div>
                    <div style={styles.inject_title}><span
                      style={{color: this.switchColor(!inject_enabled || injectDisabled)}}>{inject_title}</span></div>
                    <div style={styles.inject_date}><span
                      style={{color: this.switchColor(!inject_enabled || injectDisabled)}}>{dateFormat(inject_date)}</span></div>
                    <div style={styles.inject_user}><span
                      style={{color: this.switchColor(!inject_enabled || injectDisabled)}}>{inject_user}</span></div>
                    <div style={styles.inject_audiences}><span
                      style={{color: this.switchColor(!inject_enabled || injectDisabled)}}>{inject_users_number.toString()}</span></div>
                    <div className="clearfix"></div>
                  </div>
                }
              />
            })}
          </List>
          <CreateInject exerciseId={exerciseId} eventId={eventId} incidentId={incident.incident_id}
                        inject_types={this.props.inject_types} audiences={this.props.audiences} subaudiences={this.props.subaudiences}/>
          <Toolbar type={Constants.TOOLBAR_TYPE_EVENT}>
            <ToolbarTitle type={Constants.TOOLBAR_TYPE_EVENT} text={event_title}/>
            <EventPopover exerciseId={exerciseId} eventId={eventId} event={event}/>
          </Toolbar>
          <Dialog
            title={R.propOr('-', 'inject_title', this.state.currentInject)}
            modal={false}
            open={this.state.openView}
            autoScrollBodyContent={true}
            onRequestClose={this.handleCloseView.bind(this)}
            actions={viewActions}>
              <InjectView inject={this.state.currentInject} audiences={this.props.audiences} subaudiences={this.props.subaudiences}/>
            </Dialog>
        </div>
      </div>
    } else if (event) {
      return <div style={styles.container}>
        <IncidentNav exerciseId={exerciseId} eventId={eventId} incidents={incidents}
                     incident_types={this.props.incident_types}/>
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
  subaudiences: PropTypes.array,
  eventId: PropTypes.string,
  event: PropTypes.object,
  incident_types: PropTypes.object,
  incident: PropTypes.object,
  incidents: PropTypes.array,
  inject_types: PropTypes.object,
  injects: PropTypes.object,
  subobjectives: PropTypes.array,
  allIncidents: PropTypes.array,
  fetchAudiences: PropTypes.func,
  fetchSubaudiences: PropTypes.func,
  fetchSubobjectives: PropTypes.func,
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

const filterSubaudiences = (subaudiences, exerciseId) => {
  let subaudiencesFilterAndSorting = R.pipe(
    R.values,
    R.filter(n => n.subaudience_exercise === exerciseId),
    R.sort((a, b) => a.subaudience_name.localeCompare(b.subaudience_name))
  )
  return subaudiencesFilterAndSorting(subaudiences)
}

const filterSubobjectives = (subobjectives, exerciseId) => {
  let subobjectivesFilterAndSorting = R.pipe(
    R.values,
    R.filter(n => n.subobjective_exercise === exerciseId),
    R.sort((a, b) => a.subobjective_title.localeCompare(b.subobjective_title))
  )
  return subobjectivesFilterAndSorting(subobjectives)
}

const filterIncidents = (incidents, eventId) => {
  let incidentsFilterAndSorting = R.pipe(
    R.values,
    R.filter(n => n.incident_event.event_id === eventId),
    R.sort((a, b) => a.incident_order > b.incident_order)
  )
  return incidentsFilterAndSorting(incidents)
}

const select = (state, ownProps) => {
  let exerciseId = ownProps.params.exerciseId
  let eventId = ownProps.params.eventId
  let audiences = filterAudiences(state.referential.entities.audiences, exerciseId)
  let subaudiences = filterSubaudiences(state.referential.entities.subaudiences, exerciseId)
  let subobjectives = filterSubobjectives(state.referential.entities.subobjectives, exerciseId)
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
    subaudiences,
    subobjectives,
    injects: state.referential.entities.injects,
    incident_types: state.referential.entities.incident_types,
    inject_types: state.referential.entities.inject_types,
    allIncidents: R.values(state.referential.entities.incidents),
  }
}

export default connect(select, {
  fetchAudiences,
  fetchSubaudiences,
  fetchSubobjectives,
  fetchEvents,
  fetchIncidentTypes,
  fetchIncidents,
  fetchInjectTypes,
  fetchInjects
})(Index);
