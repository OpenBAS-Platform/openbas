import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import R from 'ramda'
import moment from 'moment';
import * as Constants from '../../../../constants/ComponentTypes'
import {List} from '../../../../components/List'
import {MainListItemLink} from '../../../../components/list/ListItem';
import {Icon} from '../../../../components/Icon'
import {fetchAudiences} from '../../../../actions/Audience'
import {fetchDryruns} from '../../../../actions/Dryrun'
import {fetchComchecks} from '../../../../actions/Comcheck'

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
  'dryrun_audience': {
    float: 'left',
    padding: '5px 0 0 0'
  },
  'dryrun_status': {
    float: 'left',
    padding: '5px 0 0 0'
  },
  'dryrun_date': {
    float: 'right',
    width: '130px',
    padding: '5px 0 0 0'
  }
}

class IndexExcerciseDryrun extends Component {
  componentDidMount() {
    this.props.fetchAudiences(this.props.exerciseId)
    this.props.fetchDryruns(this.props.exerciseId)
    this.props.fetchComchecks(this.props.exerciseId)
  }

  render() {
    return (
      <div style={styles.container}>
        <div style={styles.columnLeft}>
          <div style={styles.title}>Dryruns</div>
          <div className="clearfix"></div>
          {this.props.dryruns.length === 0 ?
            <div style={styles.empty}>You do not have any dryruns in this exercise.</div> : ""}
          <List>
            {this.props.dryruns.map(dryrun => {
              let dryrun_audience = R.propOr({}, dryrun.dryrun_audience.audience_id, this.props.audiences)
              let audienceName = R.propOr('-', 'audience_name', dryrun_audience)
              return (
                <MainListItemLink
                  to={'/private/exercise/' + this.props.exerciseId + '/checks/dryrun/' + dryrun.dryrun_id}
                  key={dryrun.dryrun_id}
                  primaryText={
                    <div>
                      <div style={styles.dryrun_audience}>{audienceName}</div>
                      <div style={styles.dryrun_date}>{moment(dryrun.dryrun_date).format('YYYY-DD-MM HH:mm')}</div>
                      <div className="clearfix"></div>
                    </div>
                  }
                  leftIcon={<Icon name={Constants.ICON_NAME_NOTIFICATION_ONDEMAND_VIDEO} type={Constants.ICON_TYPE_MAINLIST}/>}
                />
              )
            })}
          </List>
        </div>
        <div style={styles.columnRight}>
          <div style={styles.title}>Comchecks</div>
          <div className="clearfix"></div>
          {this.props.comchecks.length === 0 ?
            <div style={styles.empty}>You do not have any comchecks in this exercise.</div> : ""}
          <List>
            {this.props.comchecks.map(comcheck => {
              let comcheck_audience = R.propOr({}, comcheck.comcheck_audience.audience_id, this.props.audiences)
              let audienceName = R.propOr('-', 'audience_name', comcheck_audience)
              return (
                <MainListItemLink
                  to={'/private/exercise/' + this.props.exerciseId + '/checks/comcheck/' + comcheck.comcheck_id}
                  key={comcheck.comcheck_id}
                  primaryText={
                    <div>
                      <div style={styles.dryrun_audience}>{audienceName}</div>
                      <div style={styles.dryrun_date}>{moment(comcheck.comcheck_start_date).format('YYYY-DD-MM HH:mm')}</div>
                      <div className="clearfix"></div>
                    </div>
                  }
                  leftIcon={<Icon name={Constants.ICON_NAME_NOTIFICATION_NETWORK_CHECK} type={Constants.ICON_TYPE_MAINLIST}/>}
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
  audiences: PropTypes.object,
  dryruns: PropTypes.array,
  comchecks: PropTypes.array,
  fetchAudiences: PropTypes.func,
  fetchDryruns: PropTypes.func,
  fetchComchecks: PropTypes.func
}

const filterDryruns = (dryruns, exerciseId) => {
  let dryrunsFilterAndSorting = R.pipe(
    R.values,
    R.filter(n => n.dryrun_exercise.exercise_id === exerciseId),
    R.sort((a, b) => a.dryrun_date < b.dryrun_date)
  )
  return dryrunsFilterAndSorting(dryruns)
}

const filterComchecks = (comchecks, exerciseId) => {
  let comchecksFilterAndSorting = R.pipe(
    R.values,
    R.filter(n => n.comcheck_exercise.exercise_id === exerciseId),
    R.sort((a, b) => a.comcheck_start_date < b.comcheck_start_date)
  )
  return comchecksFilterAndSorting(comchecks)
}

const select = (state, ownProps) => {
  let exerciseId = ownProps.params.exerciseId
  let dryruns = filterDryruns(state.referential.entities.dryruns, exerciseId)
  let comchecks = filterComchecks(state.referential.entities.comchecks, exerciseId)

  return {
    exerciseId,
    audiences: state.referential.entities.audiences,
    dryruns,
    comchecks
  }
}

export default connect(select, {fetchAudiences, fetchDryruns, fetchComchecks})(IndexExcerciseDryrun)