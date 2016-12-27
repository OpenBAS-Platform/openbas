import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import R from 'ramda'
import {T} from '../../../../components/I18n'
import {i18nRegister} from '../../../../utils/Messages'
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

i18nRegister({
  fr: {
    'Name': 'Nom',
    'Email address': 'Adresse email',
    'Organization': 'Organisation',
    'Last update': 'Mise à jour',
    'State': 'Statut'
  }
})

const styles = {
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
      width: '6%',
      fontSize: '12px',
      textTransform: 'uppercase',
      textAlign: 'center',
      fontWeight: '700'
    }
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
    marginTop: '5px',
    color: "#848484"
  },
  'empty': {
    marginTop: 30,
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
    width: '6%',
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
      <T>{label}</T> {IconDisplay}
    </div>
  }

  //TODO MOVE THAT TO UTILS
  ascend(a, b) { // replace with sortWith after Ramdajs new release
    return a < b ? -1 : a > b ? 1 : 0;
  }

  descend(a, b) { // replace with sortWith after Ramdajs new release
    return a > b ? -1 : a < b ? 1 : 0;
  }

  modelSorting(criteria, ascending, a, b) {
    //TODO Add real type support for instant, boolean, ...
    var fieldA = R.compose(R.toLower, R.toString, R.propOr('', criteria))(a)
    var fieldB = R.compose(R.toLower, R.toString, R.propOr('', criteria))(b)
    return ascending ? this.ascend(fieldA, fieldB) : this.descend(fieldA, fieldB)
  }

  //TODO MOVE THAT TO UTILS

  buildUserModel(status) {
    let user_id = R.pathOr(Math.random(), ['status_user', 'user_id'], status)
    let user = R.propOr({}, user_id, this.props.users)
    let user_organization = R.propOr({}, user.user_organization, this.props.organizations)
    return {
      user_firstname: R.propOr('-', 'user_firstname', user),
      user_lastname: R.propOr('-', 'user_lastname', user),
      user_email: R.propOr('-', 'user_email', user),
      user_gravatar: R.propOr('', 'user_gravatar', user),
      user_organization: R.propOr('-', 'organization_name', user_organization),
      status_id: R.propOr(Math.random(), 'status_id', status),
      status_state: R.propOr(false, 'status_state', status),
      status_last_update: R.propOr('', 'status_last_update', status)
    }
  }

  render() {
    const data = R.pipe(
      R.map(status => this.buildUserModel(status)),
      R.sort((a, b) => this.modelSorting(this.state.sortBy, this.state.orderAsc, a, b))
    )(this.props.comcheck_statuses);

    return <div>
      <div>
        <div style={styles.title}>Comcheck</div>
        <div style={styles.audience}>{this.props.audience.audience_name}</div>
        <div className="clearfix"></div>
        <div style={styles.subtitle}>{dateFormat(this.props.comcheck.comcheck_start_date)} &rarr; {dateFormat(this.props.comcheck.comcheck_end_date)}</div>
        <div className="clearfix"></div>
        <List>
          <AvatarHeaderItem leftAvatar={<span style={styles.header.avatar}>#</span>} primaryText={
            <div>
              {this.SortHeader('user_firstname', 'Name')}
              {this.SortHeader('user_email', 'Email address')}
              {this.SortHeader('user_organization', 'Organization')}
              {this.SortHeader('status_last_update', 'Last update')}
              {this.SortHeader('status_state', 'State')}
              <div className="clearfix"></div>
            </div>}
          />

          {data.map(item => {
            //Return the dom
            return <AvatarListItem
              key={item.status_id}
              leftAvatar={<Avatar type={Constants.AVATAR_TYPE_MAINLIST} src={item.user_gravatar}/>}
              primaryText={
                <div>
                  <div style={styles.name}>{item.user_firstname} {item.user_lastname}</div>
                  <div style={styles.mail}>{item.user_email}</div>
                  <div style={styles.org}>{item.user_organization}</div>
                  <div style={styles.update}>{dateFormat(item.status_last_update)}</div>
                  <div style={styles.state}><Icon name={Constants.ICON_NAME_ACTION_CHECK_CIRCLE}
                                                  color={item.status_state ? "#4CAF50" : "#F44336"}/></div>
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
