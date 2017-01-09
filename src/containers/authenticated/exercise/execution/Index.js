import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import Rx from 'rxjs/Rx'
import {FIVE_SECONDS} from '../../../../utils/Time'
import R from 'ramda'
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
import {fetchAllInjects, fetchInjectTypes} from '../../../../actions/Inject'
import ExercisePopover from './ExercisePopover'
import InjectPopover from '../scenario/event/InjectPopover'
import InjectView from '../scenario/event/InjectView'
import InjectStatusView from './InjectStatusView'

i18nRegister({
  fr: {
    'Next inject': 'Le prochain inject',
    'Execution': 'Exécution',
    'Pending injects': 'Injects en attente',
    'Processed injects': 'Injects traités',
    'You do not have any pending injects in this exercise.': 'Vous n\'avez aucun inject en attente dans cet exercice.',
    'You do not have any processed injects in this exercise.': 'Vous n\'avez aucun inject traité dans cet exercice.',
    'Inject view': 'Vue de l\'inject',
    'Status': 'Statut'
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
    padding: '5px 0 0 0'
  },
  'inject_date': {
    float: 'right',
    padding: '5px 30px 0 0'
  }
}

class IndexExecution extends Component {
  constructor(props) {
    super(props);
    this.state = {openView: false, currentInject: {}, openStatus: false, currentStatus: {}}
  }

  componentDidMount() {
    this.props.fetchAudiences(this.props.exerciseId)
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
      case 'email':
        return <Icon name={Constants.ICON_NAME_CONTENT_MAIL} type={Constants.ICON_TYPE_MAINLIST} color={color}/>
      case 'ovh-sms':
        return <Icon name={Constants.ICON_NAME_NOTIFICATION_SMS} type={Constants.ICON_TYPE_MAINLIST} color={color}/>
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

  render() {
    const viewActions = [
      <FlatButton label="Close" primary={true} onTouchTap={this.handleCloseView.bind(this)}/>,
    ]
    const statusActions = [
      <FlatButton label="Close" primary={true} onTouchTap={this.handleCloseStatus.bind(this)}/>,
    ]

    let exerciseStatus = R.propOr('SCHEDULED', 'exercise_status', this.props.exercise)
    const countdown = this.props.nextInject ? <Countdown targetDate={this.props.nextInject}/> : ''
    return (
      <div style={styles.container}>
        <div style={styles.title}><T>Execution</T></div>
        <ExercisePopover exerciseId={this.props.exerciseId} exercise={this.props.exercise} audiences={this.props.audiences}/>
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
          {this.props.injectsPending.length === 0 ?
            <div style={styles.empty}><T>You do not have any pending injects in this exercise.</T></div> : ""}
          <List>
            {this.props.injectsPending.map(inject => {
              let injectId = R.propOr(Math.random(), 'inject_id', inject)
              let inject_title = R.propOr('-', 'inject_title', inject)
              let inject_date = R.prop('inject_date', inject)
              let inject_type = R.propOr('-', 'inject_type', inject)
              let inject_audiences = R.propOr([], 'inject_audiences', inject)
              let inject_enabled = R.propOr(true, 'inject_enabled', inject)
              return (
                <MainListItem
                  key={injectId}
                  onClick={this.handleOpenView.bind(this, inject)}
                  primaryText={
                    <div>
                      <div style={styles.inject_title}><span
                        style={{color: this.switchColor(!inject_enabled || exerciseStatus === 'CANCELED')}}>{inject_title}</span>
                      </div>
                      <div style={styles.inject_date}><span
                        style={{color: this.switchColor(!inject_enabled || exerciseStatus === 'CANCELED')}}>{dateFormat(inject_date)}</span>
                      </div>
                      <div className="clearfix"></div>
                    </div>
                  }
                  leftIcon={this.selectIcon(inject_type, this.switchColor(!inject_enabled || exerciseStatus === 'CANCELED'))}
                  rightIconButton={
                    <InjectPopover
                      type={Constants.INJECT_EXEC}
                      exerciseId={this.props.exerciseId}
                      eventId={inject.inject_event}
                      incidentId={inject.inject_incident.incident_id}
                      inject={inject}
                      injectAudiencesIds={inject_audiences.map(a => a.audience_id)}
                      audiences={this.props.audiences}
                      inject_types={this.props.inject_types}
                    />
                  }
                />
              )
            })}
          </List>
          <Dialog
            title="Inject view"
            modal={false}
            open={this.state.openView}
            autoScrollBodyContent={true}
            onRequestClose={this.handleCloseView.bind(this)}
            actions={viewActions}>
            <InjectView inject={this.state.currentInject}/>
          </Dialog>
        </div>
        <div style={styles.columnRight}>
          <div style={styles.title}><T>Processed injects</T></div>
          <div className="clearfix"></div>
          {this.props.injectsProcessed.length === 0 ?
            <div style={styles.empty}><T>You do not have any processed injects in this exercise.</T></div> : ""}
          <List>
            {this.props.injectsProcessed.map(inject => {
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
  inject_types: PropTypes.object,
  injectsPending: PropTypes.array,
  injectsProcessed: PropTypes.array,
  nextInject: PropTypes.string,
  fetchAllInjects: PropTypes.func,
  fetchAudiences: PropTypes.func,
  fetchInjectTypes: PropTypes.func
}

const filterInjectsPending = (state, ownProps) => {
  const injects = state.referential.entities.injects
  const exerciseId = ownProps.params.exerciseId
  let injectsFilterAndSorting = R.pipe(
    R.values,
    R.filter(n => n.inject_exercise === exerciseId && n.inject_status.status_name === 'PENDING'),
    R.sort((a, b) => a.inject_date > b.inject_date)
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
    R.sort((a, b) => a.inject_date < b.inject_date)
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
    inject_types: (state) => state.referential.entities.inject_types
  })
}

export default connect(select, {fetchAudiences, fetchAllInjects, fetchInjectTypes})(IndexExecution)
