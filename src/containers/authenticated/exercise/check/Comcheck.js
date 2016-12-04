import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import R from 'ramda'
import * as Constants from '../../../../constants/ComponentTypes'
import {fetchUsers} from '../../../../actions/User'
import {fetchOrganizations} from '../../../../actions/Organization'
import {fetchAudiences} from '../../../../actions/Audience'
import {fetchComcheck, fetchComcheckStatuses} from '../../../../actions/Comcheck'
import {List} from '../../../../components/List'
import {AvatarListItem, AvatarHeaderItem} from '../../../../components/list/ListItem';
import {Avatar} from '../../../../components/Avatar'
import {Icon} from '../../../../components/Icon'
import {dateFormat} from '../../../../utils/Time'

const styles = {
  'container': {}
  ,
  'header': {
    'avatar': {
      fontSize: '12px',
      textTransform: 'uppercase',
      fontWeight: '700',
      padding: '12px 0 0 15px'
    },
    'user_firstname': {
      float: 'left',
      width: '22%',
      fontSize: '12px',
      textTransform: 'uppercase',
      fontWeight: '700'
    },
    'user_email': {
      float: 'left',
      width: '35%',
      fontSize: '12px',
      textTransform: 'uppercase',
      fontWeight: '700'
    },
    'user_organization': {
      float: 'left',
      width: '22%',
      fontSize: '12px',
      textTransform: 'uppercase',
      fontWeight: '700'
    },
    'status_last_update': {
      float: 'left',
      width: '15%',
      fontSize: '12px',
      textTransform: 'uppercase',
      fontWeight: '700'
    },
    'status_state': {
      float: 'right',
      width: '8%',
      fontSize: '12px',
      textTransform: 'uppercase',
      fontWeight: '700'
    }
  },
  'title': {
    float: 'left',
    fontSize: '20px',
    fontWeight: 600
  },
  'subtitle': {
    float: 'left',
    fontSize: '14px',
  },
  'empty': {
    marginTop: 40,
    fontSize: '18px',
    fontWeight: 500,
    textAlign: 'center'
  },
  'number': {
    float: 'right',
    color: '#9E9E9E',
    fontSize: '12px',
  },
  'name': {
    float: 'left',
    width: '22%',
    padding: '5px 0 0 0'
  },
  'mail': {
    float: 'left',
    width: '35%',
    padding: '5px 0 0 0'
  },
  'org': {
    float: 'left',
    width: '22%',
    padding: '5px 0 0 0'
  },
  'update': {
    float: 'left',
    width: '15%',
    padding: '5px 0 0 0'
  },
  'state': {
    float: 'right',
    textAlign: 'center',
    padding: 0
  }
}

class Comcheck extends Component {
  constructor(props) {
    super(props);
    this.state = {sortBy: 'user_firstname', orderAsc: true}
  }

  componentDidMount() {
    this.props.fetchComcheck(this.props.exerciseId, this.props.comcheckId)
    this.props.fetchComcheckStatuses(this.props.exerciseId, this.props.comcheckId)
    this.props.fetchAudiences(this.props.exerciseId)
    this.props.fetchUsers()
    this.props.fetchOrganizations()
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
    this.props.fetchComcheckStatuses(this.props.exerciseId, this.props.comcheckId, true)
  }

  reverseBy(field) {
    this.setState({sortBy: field, orderAsc: !this.state.orderAsc})
  }

  SortHeader(field, label) {
    var icon = this.state.orderAsc ? Constants.ICON_NAME_NAVIGATION_ARROW_DROP_DOWN
      : Constants.ICON_NAME_NAVIGATION_ARROW_DROP_UP
    const IconDisplay = this.state.sortBy === field ? <Icon type={Constants.ICON_TYPE_SORT} name={icon}/> : ""
    return <div style={styles.header[field]} onClick={this.reverseBy.bind(this, field)}>
      {label} {IconDisplay}
    </div>
  }

  //TODO replace with sortWith after Ramdajs new release
  ascend(a, b) {
    return a < b ? -1 : a > b ? 1 : 0;
  }

  descend(a, b) {
    return a > b ? -1 : a < b ? 1 : 0;
  }

  render() {
    return <div style={styles.container}>
      <div>
        <div style={styles.title}>Comcheck to audience {this.props.audience.audience_name}</div>
        <div className="clearfix"></div>
        <div style={styles.subtitle}>From {dateFormat(this.props.comcheck.comcheck_start_date)} to {dateFormat(this.props.comcheck.comcheck_end_date)}</div>
        <div className="clearfix"></div>
        <List>
          <AvatarHeaderItem leftAvatar={<span style={styles.header.avatar}>#</span>} primaryText={
            <div>
              {this.SortHeader('user_firstname', 'name')}
              {this.SortHeader('user_email', 'Email address')}
              {this.SortHeader('user_organization', 'Organization')}
              {this.SortHeader('status_last_update', 'Last update')}
              {this.SortHeader('status_state', 'State')}
              <div className="clearfix"></div>
            </div>}
          />

          {this.props.comcheck_statuses.map(status => {
            let status_id = R.propOr(Math.random(), 'status_id', status)
            let status_state = R.propOr(0, 'status_state', status)
            let status_last_update = R.propOr('', 'status_last_update', status)
            let user_id = R.pathOr(Math.random(), ['status_user', 'user_id'], status)
            let user = R.propOr({}, user_id, this.props.users)
            let user_firstname = R.propOr('-', 'user_firstname', user)
            let user_lastname = R.propOr('-', 'user_lastname', user)
            let user_email = R.propOr('-', 'user_email', user)
            let user_gravatar = R.propOr('', 'user_gravatar', user)
            let user_organization = R.propOr({}, user.user_organization, this.props.organizations)
            let organizationName = R.propOr('-', 'organization_name', user_organization)

            //Return the dom
            return <AvatarListItem
              key={status_id}
              leftAvatar={<Avatar type={Constants.AVATAR_TYPE_MAINLIST} src={user_gravatar}/>}
              primaryText={
                <div>
                  <div style={styles.name}>{user_firstname} {user_lastname}</div>
                  <div style={styles.mail}>{user_email}</div>
                  <div style={styles.org}>{organizationName}</div>
                  <div style={styles.update}>{dateFormat(status_last_update)}</div>
                  <div style={styles.state}><Icon name={Constants.ICON_NAME_ACTION_CHECK_CIRCLE} color={status_state ? "#4CAF50": "#F44336"}/></div>
                  <div className="clearfix"></div>
                </div>
              }
            />
          })}
        </List>
      </div>
    </div>
  }
}

Comcheck.propTypes = {
  exerciseId: PropTypes.string,
  comcheckId: PropTypes.string,
  audience: PropTypes.object,
  comcheck: PropTypes.object,
  comcheck_statuses: PropTypes.array,
  users: PropTypes.object,
  organizations: PropTypes.object,
  fetchComcheck: PropTypes.func,
  fetchComcheckStatuses: PropTypes.func,
  fetchUsers: PropTypes.func,
  fetchAudiences: PropTypes.func,
  fetchOrganizations: PropTypes.func,
}

const filterComcheckStatuses = (statuses, comcheckId) => {
  let statusesFilter = R.pipe(
    R.values,
    R.filter(n => n.status_comcheck.comcheck_id === comcheckId)
  )
  return statusesFilter(statuses)
}

const select = (state, ownProps) => {
  let exerciseId = ownProps.params.exerciseId
  let comcheckId = ownProps.params.comcheckId
  let comcheck = R.propOr({}, comcheckId, state.referential.entities.comchecks)
  let audience = comcheck.comcheck_audience ? R.propOr({}, comcheck.comcheck_audience.audience_id, state.referential.entities.audiences) : {}
  let comcheck_statuses = filterComcheckStatuses(state.referential.entities.comchecks_statuses, comcheckId)

  return {
    exerciseId,
    comcheckId,
    audience,
    comcheck,
    comcheck_statuses,
    users: state.referential.entities.users,
    organizations: state.referential.entities.organizations,
  }
}

export default connect(select, {
  fetchComcheck,
  fetchComcheckStatuses,
  fetchUsers,
  fetchAudiences,
  fetchOrganizations
})(Comcheck);
