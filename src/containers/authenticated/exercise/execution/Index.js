import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import Rx from 'rxjs/Rx'
import {FIVE_SECONDS, timeDiff} from '../../../../utils/Time'
import * as R from 'ramda'
import {i18nRegister} from '../../../../utils/Messages'
import {dateFormat} from '../../../../utils/Time'
import {equalsSelector} from '../../../../utils/Selectors'
import Theme from '../../../../components/Theme'
import {T} from '../../../../components/I18n'
import * as Constants from '../../../../constants/ComponentTypes'
import {List} from '../../../../components/List'
import {MainListItem} from '../../../../components/list/ListItem'
import {Icon} from '../../../../components/Icon'
import {LinearProgress} from '../../../../components/LinearProgress'
import {Dialog} from '../../../../components/Dialog'
import {FlatButton} from '../../../../components/Button'
import {CircularSpinner} from '../../../../components/Spinner'
import Countdown from '../../../../components/Countdown'
import {fetchAudiences} from '../../../../actions/Audience'
import {fetchSubaudiences} from '../../../../actions/Subaudience'
import {fetchAllInjects, fetchInjectTypes} from '../../../../actions/Inject'
import {downloadFile} from '../../../../actions/File'
import ExercisePopover from './ExercisePopover'
import InjectPopover from '../scenario/event/InjectPopover'
import InjectView from '../scenario/event/InjectView'
import InjectStatusView from './InjectStatusView'

i18nRegister({
  fr: {
    'Next inject': 'La prochaine injection',
    'Execution': 'Exécution',
    'Pending injects': 'Injections en attente',
    'Processed injects': 'Injections traités',
    'You do not have any pending injects in this exercise.': 'Vous n\'avez aucune injection en attente dans cet exercice.',
    'You do not have any processed injects in this exercise.': 'Vous n\'avez aucune injection traitée dans cet exercice.',
    'Inject view': 'Vue de l\'injection',
    'Status': 'Statut'
  }
})

const styles = {
  'container': {
    textAlign: 'center'
  },
  'columnLeft': {
    float: 'left',
    width: '49%',
    margin: 0,
    padding: 0,
    textAlign: 'left'
  },
  'columnRight': {
    float: 'right',
    width: '49%',
    margin: 0,
    padding: 0,
    textAlign: 'left'
  },
  'title': {
    float: 'left',
    fontSize: '13px',
    textTransform: 'uppercase'
  },
  'status': {
    float: 'right',
    fontSize: '15px',
    fontWeight: '600'
  },
  'subtitle': {
    float: 'left',
    fontSize: '12px',
    color: "#848484",
    height: '29px'
  },
  'state': {
    float: 'right',
  },
  'empty': {
    marginTop: 40,
    fontSize: '18px',
    fontWeight: 500,
    textAlign: 'left'
  },
  'inject_title': {
    float: 'left',
    padding: '5px 0 0 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  'inject_date': {
    float: 'right',
    padding: '5px 30px 0 0'
  }
}

class IndexExecution extends Component {
  constructor(props) {
    super(props)
    this.state = {
      openView: false,
      currentInject: {},
      openStatus: false,
      currentStatus: {}
    }
  }

  componentDidMount() {
    this.props.fetchAudiences(this.props.exerciseId)
    this.props.fetchSubaudiences(this.props.exerciseId)
    this.props.fetchInjectTypes()
    const initialStream = Rx.Observable.of(1); //Fetch on loading
    const intervalStream = Rx.Observable.interval(FIVE_SECONDS) //Fetch every five seconds
    this.subscription = initialStream
      .merge(intervalStream)
      .exhaustMap(() => this.props.fetchAllInjects(this.props.exerciseId, true)) //Fetch only if previous call finished
      .subscribe()
  }

  componentWillUnmount() {
    this.subscription.unsubscribe()
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

  selectStatus(status) {
    switch (status) {
      case 'SCHEDULED':
        return <Icon name={Constants.ICON_NAME_ACTION_SCHEDULE} color={Theme.palette.primary1Color}/>
      case 'RUNNING':
        return <CircularSpinner size={20} color={Theme.palette.primary1Color}/>
      case 'FINISHED':
        return <Icon name={Constants.ICON_NAME_ACTION_DONE_ALL} color={Theme.palette.primary1Color}/>
      case 'CANCELED':
        return <Icon name={Constants.ICON_NAME_NAVIGATION_CANCEL} color={Theme.palette.primary1Color}/>
      default:
        return <Icon name={Constants.ICON_NAME_ACTION_SCHEDULE} color={Theme.palette.primary1Color}/>
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

  handleOpenStatus(inject) {
    this.setState({currentStatus: inject, openStatus: true})
  }

  handleCloseStatus() {
    this.setState({openStatus: false})
  }

  downloadAttachment(file_id, file_name) {
    return this.props.downloadFile(file_id, file_name)
  }

  render() {
    const viewActions = [
      <FlatButton key="close" label="Close" primary={true} onClick={this.handleCloseView.bind(this)}/>,
    ]
    const statusActions = [
      <FlatButton key="close" label="Close" primary={true} onClick={this.handleCloseStatus.bind(this)}/>,
    ]

    let exerciseStatus = R.propOr('SCHEDULED', 'exercise_status', this.props.exercise)
    const countdown = this.props.nextInject ? <Countdown targetDate={this.props.nextInject}/> : ''
    return (
      <div style={styles.container}>
        <div style={styles.title}><T>Execution</T></div>
        <ExercisePopover exerciseId={this.props.exerciseId} exercise={this.props.exercise}/>
        <div style={styles.status}><T>{exerciseStatus}</T></div>
        <div className="clearfix"></div>
        <div style={styles.subtitle}>
          {dateFormat(R.propOr(undefined, 'exercise_start_date', this.props.exercise))}
          &nbsp;&rarr;&nbsp;
          {dateFormat(R.propOr(undefined, 'exercise_end_date', this.props.exercise))}
        </div>
        <div style={styles.state}>{this.selectStatus(exerciseStatus)}</div>
        <div className="clearfix"></div>
        <br />
        <LinearProgress
          mode={this.props.injectsProcessed.length === 0 && exerciseStatus === 'RUNNING' ? 'indeterminate' : 'determinate'}
          min={0} max={this.props.injectsPending.length + this.props.injectsProcessed.length}
          value={this.props.injectsProcessed.length}/>
        <br />
        <div style={styles.columnLeft}>
          <div style={styles.title}><T>Pending injects</T> {countdown}</div>
          <div className="clearfix"></div>
          <List>
            {this.props.injectsPending.length === 0 ?
              <div style={styles.empty}><T>You do not have any pending injects in this exercise.</T></div> : ""}
            {R.take(30, this.props.injectsPending).map(inject => {
              let injectId = R.propOr(Math.random(), 'inject_id', inject)
              let inject_title = R.propOr('-', 'inject_title', inject)
              let inject_date = R.prop('inject_date', inject)
              let inject_type = R.propOr('-', 'inject_type', inject)
              let inject_audiences = R.propOr([], 'inject_audiences', inject)
              let inject_subaudiences = R.propOr([], 'inject_subaudiences', inject)
              let inject_enabled = R.propOr(true, 'inject_enabled', inject)
              let injectNotSupported = R.propOr(false, inject_type, this.props.inject_types) ? false : true
              let inject_in_progress = R.path(['inject_status', 'status_name'], inject) === 'PENDING'
              let injectIcon = inject_in_progress ?
                <CircularSpinner size={20} type={Constants.SPINNER_TYPE_INJECT} color={Theme.palette.primary1Color}/> :
                this.selectIcon(inject_type, this.switchColor(!inject_enabled || injectNotSupported || exerciseStatus === 'CANCELED'))
              return (
                <MainListItem
                  key={injectId}
                  onClick={this.handleOpenView.bind(this, inject)}
                  primaryText={
                    <div>
                      <div style={styles.inject_title}><span
                        style={{color: this.switchColor(!inject_enabled || injectNotSupported || exerciseStatus === 'CANCELED')}}>{inject_title}</span>
                      </div>
                      <div style={styles.inject_date}><span
                        style={{color: this.switchColor(!inject_enabled || injectNotSupported || exerciseStatus === 'CANCELED')}}>{dateFormat(inject_date)}</span>
                      </div>
                      <div className="clearfix"></div>
                    </div>
                  }
                  leftIcon={injectIcon}
                  rightIconButton={!inject_in_progress ?
                    <InjectPopover
                      type={Constants.INJECT_EXEC}
                      exerciseId={this.props.exerciseId}
                      eventId={inject.inject_event}
                      incidentId={inject.inject_incident.incident_id}
                      inject={inject}
                      injectAudiencesIds={inject_audiences.map(a => a.audience_id)}
                      injectSubaudiencesIds={inject_subaudiences.map(a => a.subaudience_id)}
                      audiences={this.props.audiences}
                      subaudiences={R.values(this.props.subaudiences)}
                      inject_types={this.props.inject_types}
                      location="run"
                    /> : null
                  }
                />
              )
            })}
          </List>
          <Dialog
            title={R.propOr('-', 'inject_title', this.state.currentInject)}
            modal={false}
            open={this.state.openView}
            autoScrollBodyContent={true}
            onRequestClose={this.handleCloseView.bind(this)}
            actions={viewActions}>
            <InjectView downloadAttachment={this.downloadAttachment.bind(this)} inject={this.state.currentInject} audiences={this.props.audiences} subaudiences={this.props.subaudiences}/>
          </Dialog>
        </div>
        <div style={styles.columnRight}>
          <div style={styles.title}><T>Processed injects</T></div>
          <div className="clearfix"></div>
          <List>
            {this.props.injectsProcessed.length === 0 ?
              <div style={styles.empty}><T>You do not have any processed injects in this exercise.</T></div> : ""}
            {R.take(30, this.props.injectsProcessed).map(inject => {
              let color = '#4CAF50'
              if (inject.inject_status.status_name === 'ERROR') {
                color = '#F44336'
              } else if (inject.inject_status.status_name === 'PARTIAL') {
                color = '#FF5722'
              }
              return (
                <MainListItem
                  key={inject.inject_id}
                  onClick={this.handleOpenStatus.bind(this, inject)}
                  primaryText={
                    <div>
                      <div style={styles.inject_title}>{inject.inject_title}</div>
                      <div style={styles.inject_date}>{dateFormat(inject.inject_date)}</div>
                      <div className="clearfix"></div>
                    </div>
                  }
                  leftIcon={this.selectIcon(inject.inject_type, color)}
                />
              )
            })}
          </List>
          <Dialog
            title="Status"
            modal={false}
            open={this.state.openStatus}
            autoScrollBodyContent={true}
            onRequestClose={this.handleCloseStatus.bind(this)}
            actions={statusActions}>
            <InjectStatusView inject={this.state.currentStatus}/>
          </Dialog>
        </div>
      </div>
    )
  }
}

IndexExecution.propTypes = {
  exerciseId: PropTypes.string,
  exercise: PropTypes.object,
  audiences: PropTypes.array,
  subaudiences: PropTypes.array,
  inject_types: PropTypes.object,
  injectsPending: PropTypes.array,
  injectsProcessed: PropTypes.array,
  nextInject: PropTypes.string,
  fetchAllInjects: PropTypes.func,
  fetchAudiences: PropTypes.func,
  fetchSubaudiences: PropTypes.func,
  fetchInjectTypes: PropTypes.func,
  downloadFile: PropTypes.func
}

const filterInjectsPending = (state, ownProps) => {
  const injects = state.referential.entities.injects
  const exerciseId = ownProps.params.exerciseId
  let injectsFilterAndSorting = R.pipe(
    R.values,
    R.filter(n => {
      let statusName = n.inject_status.status_name
      let identifiedInject = n.inject_exercise === exerciseId
      let isPendingInject = statusName === null || statusName === 'PENDING'
      return identifiedInject && isPendingInject
    }),
    R.sort((a, b) => timeDiff(a.inject_date, b.inject_date))
  )
  return injectsFilterAndSorting(injects)
}

const nextInjectToExecute = (state, ownProps) => {
  return R.pipe(
    R.filter(n => n.inject_enabled),
    R.head(),
    R.propOr(undefined, 'inject_date')
  )(filterInjectsPending(state, ownProps))
}

const filterInjectsProcessed = (state, ownProps) => {
  const injects = state.referential.entities.injects
  const exerciseId = ownProps.params.exerciseId
  let injectsFilterAndSorting = R.pipe(
    R.values,
    R.filter(n => n.inject_exercise === exerciseId && (
      n.inject_status.status_name === 'SUCCESS' ||
      n.inject_status.status_name === 'ERROR' ||
      n.inject_status.status_name === 'PARTIAL')
    ),
    R.sort((a, b) => timeDiff(b.inject_date, a.inject_date))
  )
  return injectsFilterAndSorting(injects)
}

const filterAudiences = (state, ownProps) => {
  const audiences = state.referential.entities.audiences
  const exerciseId = ownProps.params.exerciseId
  let audiencesFilterAndSorting = R.pipe(
    R.values,
    R.filter(n => n.audience_exercise.exercise_id === exerciseId),
    R.sort((a, b) => a.audience_name.localeCompare(b.audience_name))
  )
  return audiencesFilterAndSorting(audiences)
}

const exerciseSelector = (state, ownProps) => {
  const exerciseId = ownProps.params.exerciseId
  return R.prop(exerciseId, state.referential.entities.exercises)
}

const select = () => {
  return equalsSelector({ //Prevent view to refresh is nothing as changed (Using reselect)
    exerciseId: (state, ownProps) => ownProps.params.exerciseId,
    exercise: exerciseSelector,
    injectsPending: filterInjectsPending,
    nextInject: nextInjectToExecute,
    injectsProcessed: filterInjectsProcessed,
    audiences: filterAudiences,
    subaudiences: (state) => R.values(state.referential.entities.subaudiences),
    inject_types: (state) => state.referential.entities.inject_types
  })
}

export default connect(select, {fetchAudiences, fetchSubaudiences, fetchAllInjects, fetchInjectTypes, downloadFile})(IndexExecution)
