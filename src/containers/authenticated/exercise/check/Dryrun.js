import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import R from 'ramda'
import moment from 'moment';
import * as Constants from '../../../../constants/ComponentTypes'
import {List} from '../../../../components/List'
import {MainListItem} from '../../../../components/list/ListItem';
import {Icon} from '../../../../components/Icon'
import {fetchAudiences} from '../../../../actions/Audience'
import {fetchDryrun} from '../../../../actions/Dryrun'
import {fetchDryinjects} from '../../../../actions/Dryinject'

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
    textTransform: 'uppercase'
  },
  'empty': {
    marginTop: 40,
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

class IndexExcerciseDryrun extends Component {
  componentDidMount() {
    this.props.fetchDryinjects(this.props.exerciseId, this.props.dryrunId)
    this.props.fetchAudiences(this.props.exerciseId)
    this.props.fetchDryrun(this.props.exerciseId, this.props.dryrunId)
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
    this.props.fetchDryinjects(this.props.exerciseId, this.props.dryrunId, true)
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
    let audienceName = null
    if( this.props.dryrun.dryrun_audience && this.props.audiences.length > 0 ) {
      let dryrun_audience = R.find(a => a.audience_id === this.props.dryrun.dryrun_audience.audience_id)(this.props.audiences)
      audienceName = R.propOr('-', 'audience_name', dryrun_audience)
    }
    let dryrun_date = R.propOr('', 'dryrun_date', this.props.dryrun)

    return (
      <div style={styles.container}>
        <div style={styles.headtitle}>Dryrun to the audience <i>{audienceName}</i></div>
        <div style={styles.headsubtitle}>{moment(dryrun_date).format('YYYY-DD-MM HH:mm')}</div>
        <br /><br />
        <div style={styles.columnLeft}>
          <div style={styles.title}>Pending injects</div>
          <div className="clearfix"></div>
          {this.props.dryinjectsPending.length === 0 ?
            <div style={styles.empty}>You do not have any pending injects in this dryrun.</div> : ""}
          <List>
            {this.props.dryinjectsPending.map(dryinject => {
              return (
                <MainListItem
                  key={dryinject.dryinject_id}
                  primaryText={
                    <div>
                      <div style={styles.dryinject_title}>{dryinject.dryinject_title}</div>
                      <div style={styles.dryinject_date}>{moment(dryinject.dryinject_date).format('YYYY-DD-MM HH:mm')}</div>
                      <div className="clearfix"></div>
                    </div>
                  }
                  leftIcon={this.selectIcon(dryinject.dryinject_type)}
                />
              )
            })}
          </List>
        </div>
        <div style={styles.columnRight}>
          <div style={styles.title}>Processed injects</div>
          <div className="clearfix"></div>
          {this.props.dryinjectsProcessed.length === 0 ?
            <div style={styles.empty}>You do not have any processed injects in this dryrun.</div> : ""}
          <List>
            {this.props.dryinjectsProcessed.map(dryinject => {
              let color = '#4CAF50'
              if( dryinject.dryinject_status.status_name === 'ERROR' ) {
                color ='#F44336'
              } else if( dryinject.dryinject_status.status_name === 'PARTIAL' ) {
                color ='#FF5722'
              }
              return (
                <MainListItem
                  key={dryinject.dryinject_id}
                  primaryText={
                    <div>
                      <div style={styles.dryinject_title}>{dryinject.dryinject_title}</div>
                      <div style={styles.dryinject_date}>{moment(dryinject.dryinject_date).format('YYYY-DD-MM HH:mm')}</div>
                      <div className="clearfix"></div>
                    </div>
                  }
                  leftIcon={this.selectIcon(dryinject.dryinject_type, color)}
                />
              )
            })}
          </List>
        </div>
      </div>
    )
  }
}

IndexExcerciseDryrun.propTypes = {
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
    R.filter(n => n.dryinject_dryrun.dryrun_id === dryrunId && (n.dryinject_status.status_name === 'SUCCESS' || n.dryinject_status.status_name === 'ERROR')),
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

export default connect(select, {fetchAudiences, fetchDryrun, fetchDryinjects})(IndexExcerciseDryrun)