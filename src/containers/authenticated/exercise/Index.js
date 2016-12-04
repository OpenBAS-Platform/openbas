import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import R from 'ramda'
import moment from 'moment';
import * as Constants from '../../../constants/ComponentTypes'
import {List} from '../../../components/List'
import {MainListItem} from '../../../components/list/ListItem';
import {Icon} from '../../../components/Icon'
import {LinkFlatButton} from '../../../components/Button'
import {fetchObjectives} from '../../../actions/Objective'
import {fetchAudiences} from '../../../actions/Audience'
import {fetchAllInjects} from '../../../actions/Inject'
import {fetchDryruns} from '../../../actions/Dryrun'
import CreateDryrun from './check/CreateDryrun'

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
  'dryruns': {
    borderRadius: '5px',
    border: '3px solid #FF4081',
    padding: '10px',
    margin: '0 0 20px 0',
    textAlign: 'center'
  },
  'running': {
    fontWeight: '600',
    margin: '0 0 10px 0'
  }
}

class IndexExercise extends Component {
  componentDidMount() {
    this.props.fetchObjectives(this.props.exerciseId)
    this.props.fetchAudiences(this.props.exerciseId)
    this.props.fetchAllInjects(this.props.exerciseId)
    this.props.fetchDryruns(this.props.exerciseId)
    this.repeatTimeout()
  }

  componentWillUnmount() {
    //noinspection Eslint
    clearTimeout(this.repeat)
  }

  repeatTimeout() {
    //noinspection Eslint
    const context = this
    //noinspection Eslint
    this.repeat = setTimeout(function () {
      context.circularFetch()
      context.repeatTimeout(context);
    }, 5000)
  }

  circularFetch() {
    this.props.fetchAllInjects(this.props.exerciseId, true)
    this.props.fetchDryruns(this.props.exerciseId, true)
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
  render() {
    let dryruns = null
    if (this.props.dryruns.length > 0) {
      dryruns = (
        <div style={styles.dryruns}>
          <div style={styles.running}>{this.props.dryruns.length} dryrun(s) currently running:</div>
          {this.props.dryruns.map(dryrun => {
            let dryrun_audience = R.find(a => a.audience_id === dryrun.dryrun_audience.audience_id)(this.props.audiences)
            let audienceName = R.propOr('-', 'audience_name', dryrun_audience)

            return (
              <LinkFlatButton to={'/private/exercise/' + this.props.exerciseId + '/checks/dryrun/' + dryrun.dryrun_id} secondary={true}
                          key={dryrun.dryrun_id} label={audienceName}/>
            )
          })}
        </div>
      )
    }

    return (
      <div style={styles.container}>
        {dryruns}
        <div style={styles.columnLeft}>
          <div style={styles.title}>Main objectives</div>
          <div className="clearfix"></div>
          {this.props.objectives.length === 0 ?
            <div style={styles.empty}>You do not have any objectives in this exercise.</div> : ""}
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
            <div style={styles.empty}>You do not have any audiences in this exercise.</div> : ""}
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
        <div style={styles.columnLeft}>
          <div style={styles.title}>Pending injects</div>
          <div className="clearfix"></div>
          {this.props.injectsPending.length === 0 ?
            <div style={styles.empty}>You do not have any pending injects in this exercise.</div> : ""}
          <List>
            {this.props.injectsPending.map(inject => {
              return (
                <MainListItem
                  key={inject.inject_id}
                  primaryText={
                    <div>
                      <div style={styles.inject_title}>{inject.inject_title}</div>
                      <div style={styles.inject_date}>{moment(inject.inject_date).format('YYYY-DD-MM HH:mm')}</div>
                      <div className="clearfix"></div>
                    </div>
                  }
                  leftIcon={this.selectIcon(inject.inject_type)}
                />
              )
            })}
          </List>
        </div>
        <div style={styles.columnRight}>
          <div style={styles.title}>Processed injects</div>
          <div className="clearfix"></div>
          {this.props.injectsProcessed.length === 0 ?
            <div style={styles.empty}>You do not have any processed injects in this exercise.</div> : ""}
          <List>
            {this.props.injectsProcessed.map(inject => {
              let color = '#4CAF50'
              if( inject.inject_status.status_name === 'ERROR' ) {
                color ='#F44336'
              } else if( inject.inject_status.status_name === 'PARTIAL' ) {
                color ='#FF5722'
              }
              return (
                <MainListItem
                  key={inject.inject_id}
                  primaryText={
                    <div>
                      <div style={styles.inject_title}>{inject.inject_title}</div>
                      <div style={styles.inject_date}>{moment(inject.inject_date).format('YYYY-DD-MM HH:mm')}</div>
                      <div className="clearfix"></div>
                    </div>
                  }
                  leftIcon={this.selectIcon(inject.inject_type, color)}
                />
              )
            })}
          </List>
        </div>
        <CreateDryrun exerciseId={this.props.exerciseId} audiences={this.props.audiences}/>
      </div>
    )
  }
}

IndexExercise.propTypes = {
  exerciseId: PropTypes.string,
  objectives: PropTypes.array,
  audiences: PropTypes.array,
  dryruns: PropTypes.array,
  injectsPending: PropTypes.array,
  injectsProcessed: PropTypes.array,
  fetchObjectives: PropTypes.func,
  fetchAudiences: PropTypes.func,
  fetchAllInjects: PropTypes.func,
  fetchDryruns: PropTypes.func
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

const filterInjectsPending = (injects, exerciseId) => {
  let injectsFilterAndSorting = R.pipe(
    R.values,
    R.filter(n => n.inject_exercise === exerciseId && n.inject_status.status_name === 'PENDING'),
    R.sort((a, b) => a.inject_date > b.inject_date)
  )
  return injectsFilterAndSorting(injects)
}

const filterInjectsProcessed = (injects, exerciseId) => {
  let injectsFilterAndSorting = R.pipe(
    R.values,
    R.filter(n => n.inject_exercise === exerciseId && (n.inject_status.status_name === 'SUCCESS' || n.inject_status.status_name === 'ERROR')),
    R.sort((a, b) => a.inject_date < b.inject_date)
  )
  return injectsFilterAndSorting(injects)
}

const filterDryruns = (dryruns, exerciseId) => {
  let dryrunsFilterAndSorting = R.pipe(
    R.values,
    R.filter(n => n.dryrun_exercise.exercise_id === exerciseId && !n.dryrun_finished && n.dryrun_status),
    R.sort((a, b) => a.dryrun_date > b.dryrun_date)
  )
  return dryrunsFilterAndSorting(dryruns)
}

const select = (state, ownProps) => {
  let exerciseId = ownProps.params.exerciseId
  let objectives = filterObjectives(state.referential.entities.objectives, exerciseId)
  let audiences = filterAudiences(state.referential.entities.audiences, exerciseId)
  let dryruns = filterDryruns(state.referential.entities.dryruns, exerciseId)
  let injectsPending = filterInjectsPending(state.referential.entities.injects, exerciseId)
  let injectsProcessed = filterInjectsProcessed(state.referential.entities.injects, exerciseId)

  return {
    exerciseId,
    objectives,
    audiences,
    dryruns,
    injectsPending,
    injectsProcessed
  }
}

export default connect(select, {fetchObjectives, fetchAudiences, fetchAllInjects, fetchDryruns})(IndexExercise)