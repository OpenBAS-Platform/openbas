import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import * as Constants from '../../../../constants/ComponentTypes'
import {fetchUsers} from '../../../../actions/User'
import {fetchOrganizations} from '../../../../actions/Organization'
import {fetchAudiences} from '../../../../actions/Audience'
import {List} from '../../../../components/List'
import {MainListItem, HeaderItem} from '../../../../components/list/ListItem';
import {Avatar} from '../../../../components/Avatar'
import {Icon} from '../../../../components/Icon'
import AudienceNav from './AudienceNav'
import AudiencePopover from './AudiencePopover'
import AddUsers from './AddUsers'
import UserPopover from './UserPopover'
import R from 'ramda'

const styles = {
  'container': {
    paddingRight: '300px',
  },
  'header': {
    'avatar': {
      fontSize: '12px',
      textTransform: 'uppercase',
      fontWeight: '700',
      padding: '12px 0 0 15px'
    },
    'user_firstname': {
      float: 'left',
      width: '30%',
      fontSize: '12px',
      textTransform: 'uppercase',
      fontWeight: '700'
    },
    'user_email': {
      float: 'left',
      width: '40%',
      fontSize: '12px',
      textTransform: 'uppercase',
      fontWeight: '700'
    },
    'user_organization': {
      float: 'left',
      width: '30%',
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
    width: '30%',
    padding: '5px 0 0 0'
  },
  'mail': {
    float: 'left',
    width: '40%',
    padding: '5px 0 0 0'
  },
  'org': {
    float: 'left',
    padding: '5px 0 0 0'
  }
}

class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {sortBy: 'user_firstname', orderAsc: true}
  }

  reverseBy(field) {
    this.setState({sortBy: field, orderAsc: !this.state.orderAsc})
  }

  componentDidMount() {
    this.props.fetchAudiences(this.props.exerciseId)
    this.props.fetchUsers()
    this.props.fetchOrganizations()
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
    let {exerciseId, audience, audiences} = this.props
    if (audience) {
      //Build users list with sorting on column
      const users = R.pipe(
        R.map(data => R.pathOr({}, ['users', data.user_id], this.props)),
        R.sort((a, b) => { //TODO replace with sortWith after Ramdajs new release
          var fieldA = R.toLower(R.propOr('', this.state.sortBy, a))
          var fieldB = R.toLower(R.propOr('', this.state.sortBy, b))
          return this.state.orderAsc ? this.ascend(fieldA, fieldB) : this.descend(fieldA, fieldB)
        })
      )(audience.audience_users)
      //Display the component
      return <div style={styles.container}>
        <AudienceNav selectedAudience={audience.audience_id} exerciseId={exerciseId} audiences={audiences}/>
        <div>
          <div style={styles.title}>{audience.audience_name}</div>
          <AudiencePopover exerciseId={exerciseId} audience={audience}/>
          <div style={styles.number}>{audience.audience_users.length} users</div>
          <div className="clearfix"></div>

          <List>
            {audience.audience_users.length === 0 ? (
              <div style={styles.empty}>This audience is empty.</div>
            ) : (
              <HeaderItem leftAvatar={<span style={styles.header.avatar}>#</span>}
                          rightIconButton={<Icon style={{display: 'none'}}/>} primaryText={<div>
                {this.SortHeader('user_firstname', 'name')}
                {this.SortHeader('user_email', 'Email address')}
                {this.SortHeader('user_organization', 'Organization')}
                <div className="clearfix"></div>
              </div>}
              />
            )}

            {users.map(user => {
              //Setup variables
              let userId = R.propOr(Math.random(), 'user_id', user)
              let user_firstname = R.propOr('-', 'user_firstname', user)
              let user_lastname = R.propOr('-', 'user_lastname', user)
              let user_email = R.propOr('-', 'user_email', user)
              let user_gravatar = R.propOr('', 'user_gravatar', user)
              let user_organization = R.propOr({}, user.user_organization, this.props.organizations)
              let organizationName = R.propOr('-', 'organization_name', user_organization)
              //Return the dom
              return <MainListItem
                key={userId}
                leftAvatar={<Avatar type={Constants.AVATAR_TYPE_MAINLIST} src={user_gravatar}/>}
                rightIconButton={<UserPopover exerciseId={exerciseId} audience={audience} user={user}/>}
                primaryText={
                  <div>
                    <div style={styles.name}>{user_firstname} {user_lastname}</div>
                    <div style={styles.mail}>{user_email}</div>
                    <div style={styles.org}>{organizationName}</div>
                    <div className="clearfix"></div>
                  </div>
                }
              />
            })}
          </List>
          <AddUsers exerciseId={exerciseId} audienceId={audience.audience_id}
                    audienceUsersIds={audience.audience_users.map(u => u.user_id)}/>
        </div>
      </div>
    } else {
      return <div style={styles.container}>
        <AudienceNav exerciseId={exerciseId} audiences={audiences}/>
        <div style={styles.empty}>No audience selected.</div>
      </div>
    }
  }
}

Index.propTypes = {
  exerciseId: PropTypes.string,
  users: PropTypes.object,
  organizations: PropTypes.object,
  audience: PropTypes.object,
  audiences: PropTypes.array,
  fetchUsers: PropTypes.func,
  fetchAudiences: PropTypes.func,
  fetchOrganizations: PropTypes.func,
}

const filterAudiences = (audiences, exerciseId) => {
  let audiencesFilterAndSorting = R.pipe(
    R.values,
    R.filter(n => n.audience_exercise.exercise_id === exerciseId),
    R.sort((a, b) => a.audience_name.localeCompare(b.audience_name))
  )
  return audiencesFilterAndSorting(audiences)
}

const select = (state, ownProps) => {
  let exerciseId = ownProps.params.exerciseId
  let audiences = filterAudiences(state.referential.entities.audiences, exerciseId)
  //region get default audience
  let stateCurrentAudience = R.path(['exercise', exerciseId, 'current_audience'], state.screen)
  let audienceId = stateCurrentAudience === undefined && audiences.length > 0
    ? R.head(audiences).audience_id : stateCurrentAudience //Force a default audience if needed
  let audience = audienceId ? R.find(a => a.audience_id === audienceId)(audiences) : undefined
  //endregion
  return {
    exerciseId,
    audience,
    audiences,
    users: state.referential.entities.users,
    organizations: state.referential.entities.organizations,
  }
}

export default connect(select, {fetchUsers, fetchAudiences, fetchOrganizations})(Index);
