import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import R from 'ramda'
import {i18nRegister} from '../../../../utils/Messages'
import {T} from '../../../../components/I18n'
import moment from 'moment';
import * as Constants from '../../../../constants/ComponentTypes'
import {List} from '../../../../components/List'
import {MainListItem} from '../../../../components/list/ListItem';
import {Icon} from '../../../../components/Icon'
import {LinearProgress} from '../../../../components/LinearProgress'
import {CircularSpinner} from '../../../../components/Spinner'
import {fetchObjectives} from '../../../../actions/Objective'
import {fetchAudiences} from '../../../../actions/Audience'
import {fetchAllInjects} from '../../../../actions/Inject'

i18nRegister({
  fr: {
    'Execution': 'Exécution',
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
  }
}

class IndexExecution extends Component {
  componentDidMount() {
    this.props.fetchAllInjects(this.props.exerciseId)
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
    return (
      <div style={styles.container}>
        <div style={styles.title}><T>Execution</T></div>
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
      </div>
    )
  }
}

IndexExecution.propTypes = {
  exerciseId: PropTypes.string,
  injectsPending: PropTypes.array,
  injectsProcessed: PropTypes.array,
  fetchAllInjects: PropTypes.func,
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
    R.filter(n => n.inject_exercise === exerciseId && (n.inject_status.status_name === 'SUCCESS' || n.inject_status.status_name === 'ERROR' || n.inject_status.status_name === 'PARTIAL')),
    R.sort((a, b) => a.inject_date < b.inject_date)
  )
  return injectsFilterAndSorting(injects)
}

const select = (state, ownProps) => {
  let exerciseId = ownProps.params.exerciseId
  let injectsPending = filterInjectsPending(state.referential.entities.injects, exerciseId)
  let injectsProcessed = filterInjectsProcessed(state.referential.entities.injects, exerciseId)

  return {
    exerciseId,
    injectsPending,
    injectsProcessed
  }
}

export default connect(select, {fetchObjectives, fetchAudiences, fetchAllInjects})(IndexExecution)