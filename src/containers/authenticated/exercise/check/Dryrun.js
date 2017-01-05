import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import R from 'ramda'
import Rx from 'rxjs/Rx'
import {FIVE_SECONDS} from '../../../../utils/Time'
import {i18nRegister} from '../../../../utils/Messages'
import {T} from '../../../../components/I18n'
import {dateFormat} from '../../../../utils/Time'
import * as Constants from '../../../../constants/ComponentTypes'
import {List} from '../../../../components/List'
import Theme from '../../../../components/Theme'
import {Dialog} from '../../../../components/Dialog'
import {FlatButton} from '../../../../components/Button'
import {MainListItem} from '../../../../components/list/ListItem';
import {Icon} from '../../../../components/Icon'
import {LinearProgress} from '../../../../components/LinearProgress'
import {CircularSpinner} from '../../../../components/Spinner'
import Countdown from '../../../../components/Countdown'
import {fetchAudiences} from '../../../../actions/Audience'
import {fetchDryrun} from '../../../../actions/Dryrun'
import {fetchDryinjects} from '../../../../actions/Dryinject'
import DryrunPopover from './DryrunPopover'
import DryinjectView from './DryinjectView'
import DryinjectStatusView from './DryinjectStatusView'

i18nRegister({
  fr: {
    'You do not have any pending injects in this dryrun.': 'Vous n\'avez aucun inject en attente dans ce dryrun.',
    'You do not have any processed injects in this dryrun.': 'Vous n\'avez aucun inject traité dans ce dryrun.',
    'Pending injects': 'Injects en attente',
    'Processed injects': 'Injects traités',
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
  'audience': {
    float: 'right',
    fontSize: '15px',
    fontWeight: '600'
  },
  'subtitle': {
    float: 'left',
    fontSize: '12px',
    color: "#848484"
  },
  'state': {
    float: 'right',
  },
  'empty': {
    marginTop: 30,
    fontSize: '18px',
    fontWeight: 500,
    textAlign: 'left'
  },
  'dryinject_title': {
    float: 'left',
    padding: '5px 0 0 0'
  },
  'dryinject_date': {
    float: 'right',
    width: '130px',
    padding: '5px 0 0 0'
  }
}

class IndexExerciseDryrun extends Component {
  constructor(props) {
    super(props);
    this.state = {openView: false, currentDryinject: {}, openStatus: false, currentStatus: {}}
  }

  componentDidMount() {
    this.props.fetchAudiences(this.props.exerciseId)
    //Scheduler listener
    const initialStream = Rx.Observable.of(1) //Fetch on loading
    const intervalStream = Rx.Observable.interval(FIVE_SECONDS) //Fetch every five seconds
    const cancelStream = Rx.Observable.create(obs => {this.cancelStreamEvent = () => {obs.next(1)}})
    this.subscription = initialStream
      .merge(intervalStream)
      .takeUntil(cancelStream)
      .exhaustMap(() => Promise.all([
        this.props.fetchDryrun(this.props.exerciseId, this.props.dryrunId, true),
        this.props.fetchDryinjects(this.props.exerciseId, this.props.dryrunId, true)
      ])).subscribe()
  }

  componentWillReceiveProps(nextProps) {
    let dryrun_finished = R.propOr(false, 'dryrun_finished', nextProps.dryrun)
    if(dryrun_finished) this.cancelStreamEvent()
  }

  componentWillUnmount() {
    this.subscription.unsubscribe()
  }

  selectIcon(type, color) {
    switch (type) {
      case 'email':
        return <Icon name={Constants.ICON_NAME_CONTENT_MAIL} type={Constants.ICON_TYPE_MAINLIST} color={color}/>
      case 'sms':
        return <Icon name={Constants.ICON_NAME_NOTIFICATION_SMS} type={Constants.ICON_TYPE_MAINLIST} color={color}/>
      default:
        return <Icon name={Constants.ICON_NAME_CONTENT_MAIL} type={Constants.ICON_TYPE_MAINLIST} color={color}/>
    }
  }

  handleOpenView(dryinject) {
    this.setState({currentDryinject: dryinject, openView: true})
  }

  handleCloseView() {
    this.setState({openView: false})
  }

  handleOpenStatus(dryinject) {
    this.setState({currentStatus: dryinject, openStatus: true})
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

    let audienceName = null
    if (this.props.dryrun.dryrun_audience && this.props.audiences.length > 0) {
      let dryrun_audience = R.find(a => a.audience_id === this.props.dryrun.dryrun_audience.audience_id)(this.props.audiences)
      audienceName = R.propOr('-', 'audience_name', dryrun_audience)
    }
    let dryrun_date = R.propOr('', 'dryrun_date', this.props.dryrun)
    let dryrun_finished = R.propOr(false, 'dryrun_finished', this.props.dryrun)

    const nextDryinject = R.propOr(undefined, 'dryinject_date', R.head(this.props.dryinjectsPending))
    const countdown = nextDryinject ? <Countdown targetDate={nextDryinject}/> : ''

    return (
      <div style={styles.container}>
        <div style={styles.title}>Dryrun</div>
        <DryrunPopover exerciseId={this.props.exerciseId} dryrun={this.props.dryrun} listenDeletionCall={this.cancelStreamEvent}/>
        <div style={styles.audience}>{audienceName}</div>
        <div className="clearfix"></div>
        <div style={styles.subtitle}>{dateFormat(dryrun_date)}</div>
        <div style={styles.state}>{dryrun_finished ?
          <Icon name={Constants.ICON_NAME_ACTION_DONE_ALL} color={Theme.palette.primary1Color}/> :
          <CircularSpinner size={20} color={Theme.palette.primary1Color}/>}</div>
        <div className="clearfix"></div>
        <br />
        <LinearProgress mode={this.props.dryinjectsProcessed.length === 0 ? 'indeterminate' : 'determinate'} min={0}
                        max={this.props.dryinjectsPending.length + this.props.dryinjectsProcessed.length}
                        value={this.props.dryinjectsProcessed.length}/>
        <br /><br />
        <div style={styles.columnLeft}>
          <div style={styles.title}><T>Pending injects</T> {countdown}</div>
          <div className="clearfix"></div>
          {this.props.dryinjectsPending.length === 0 ?
            <div style={styles.empty}><T>You do not have any pending injects in this dryrun.</T></div> : ""}
          <List>
            {this.props.dryinjectsPending.map(dryinject => {
              return (
                <MainListItem
                  key={dryinject.dryinject_id}
                  onClick={this.handleOpenView.bind(this, dryinject)}
                  primaryText={
                    <div>
                      <div style={styles.dryinject_title}>{dryinject.dryinject_title}</div>
                      <div style={styles.dryinject_date}>{dateFormat(dryinject.dryinject_date)}</div>
                      <div className="clearfix"></div>
                    </div>
                  }
                  leftIcon={this.selectIcon(dryinject.dryinject_type)}
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
            <DryinjectView dryinject={this.state.currentDryinject} />
          </Dialog>
        </div>
        <div style={styles.columnRight}>
          <div style={styles.title}><T>Processed injects</T></div>
          <div className="clearfix"></div>
          {this.props.dryinjectsProcessed.length === 0 ?
            <div style={styles.empty}><T>You do not have any processed injects in this dryrun.</T></div> : ""}
          <List>
            {this.props.dryinjectsProcessed.map(dryinject => {
              let color = '#4CAF50'
              if (dryinject.dryinject_status.status_name === 'ERROR') {
                color = '#F44336'
              } else if (dryinject.dryinject_status.status_name === 'PARTIAL') {
                color = '#FF5722'
              }
              return (
                <MainListItem
                  key={dryinject.dryinject_id}
                  onClick={this.handleOpenStatus.bind(this, dryinject)}
                  primaryText={
                    <div>
                      <div style={styles.dryinject_title}>{dryinject.dryinject_title}</div>
                      <div style={styles.dryinject_date}>{dateFormat(dryinject.dryinject_date)}</div>
                      <div className="clearfix"></div>
                    </div>
                  }
                  leftIcon={this.selectIcon(dryinject.dryinject_type, color)}
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
            <DryinjectStatusView dryinject={this.state.currentStatus} />
          </Dialog>
        </div>
      </div>
    )
  }
}

IndexExerciseDryrun.propTypes = {
  exerciseId: PropTypes.string,
  dryrunId: PropTypes.string,
  audiences: PropTypes.array,
  dryrun: PropTypes.object,
  dryinjectsPending: PropTypes.array,
  dryinjectsProcessed: PropTypes.array,
  fetchAudiences: PropTypes.func,
  fetchDryinjects: PropTypes.func,
  fetchDryrun: PropTypes.func
}

const filterAudiences = (audiences, exerciseId) => {
  let audiencesFilterAndSorting = R.pipe(
    R.values,
    R.filter(n => n.audience_exercise.exercise_id === exerciseId),
    R.sort((a, b) => a.audience_name.localeCompare(b.audience_name))
  )
  return audiencesFilterAndSorting(audiences)
}

const filterDryinjectsPending = (dryinjects, dryrunId) => {
  let dryinjectsFilterAndSorting = R.pipe(
    R.values,
    R.filter(n => n.dryinject_dryrun.dryrun_id === dryrunId && n.dryinject_status.status_name === 'PENDING'),
    R.sort((a, b) => a.dryinject_date > b.dryinject_date)
  )
  return dryinjectsFilterAndSorting(dryinjects)
}

const filterDryinjectsProcessed = (dryinjects, dryrunId) => {
  let dryinjectsFilterAndSorting = R.pipe(
    R.values,
    R.filter(n => n.dryinject_dryrun.dryrun_id === dryrunId && (n.dryinject_status.status_name === 'SUCCESS' || n.dryinject_status.status_name === 'PARTIAL' || n.dryinject_status.status_name === 'ERROR' )),
    R.sort((a, b) => a.dryinject_date < b.dryinject_date)
  )
  return dryinjectsFilterAndSorting(dryinjects)
}

const select = (state, ownProps) => {
  let exerciseId = ownProps.params.exerciseId
  let dryrunId = ownProps.params.dryrunId
  let dryrun = R.propOr({}, dryrunId, state.referential.entities.dryruns)
  let audiences = filterAudiences(state.referential.entities.audiences, exerciseId)
  let dryinjectsPending = filterDryinjectsPending(state.referential.entities.dryinjects, dryrunId)
  let dryinjectsProcessed = filterDryinjectsProcessed(state.referential.entities.dryinjects, dryrunId)

  return {
    exerciseId,
    dryrunId,
    dryrun,
    audiences,
    dryinjectsPending,
    dryinjectsProcessed
  }
}

export default connect(select, {fetchAudiences, fetchDryrun, fetchDryinjects})(IndexExerciseDryrun)
