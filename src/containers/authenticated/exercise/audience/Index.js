import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import * as Constants from '../../../../constants/ComponentTypes'
import {fetchUsers} from '../../../../actions/User'
import {fetchOrganizations} from '../../../../actions/Organization'
import {fetchAudiences} from '../../../../actions/Audience'
import {List} from '../../../../components/List'
import {MainListItem} from '../../../../components/list/ListItem';
import {Avatar} from '../../../../components/Avatar'
import AudienceNav from './AudienceNav'
import AudiencePopover from './AudiencePopover'
import AddUsers from './AddUsers'
import UserPopover from './UserPopover'
import R from 'ramda'

const styles = {
  'container': {
    paddingRight: '300px',
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
  componentDidMount() {
    this.props.fetchAudiences(this.props.exerciseId)
    this.props.fetchUsers()
    this.props.fetchOrganizations()
  }

  render() {
    let {exerciseId, audience, audiences} = this.props
    if (audience) {
      return <div style={styles.container}>
        <AudienceNav selectedAudience={audience.audience_id} exerciseId={exerciseId} audiences={audiences}/>
        <div>
          <div style={styles.title}>{audience.audience_name}</div>
          <AudiencePopover exerciseId={exerciseId} audience={audience}/>
          <div style={styles.number}>{audience.audience_users.length} users</div>
          <div className="clearfix"></div>

          {audience.audience_users.length === 0 ?
            <div style={styles.empty}>This audience is empty.</div> : ""
          }

          <List>
            {audience.audience_users.map(data => {
              //Setup variables
              let user = R.propOr({}, data.user_id, this.props.users)
              let userId = R.propOr(data.user_id, 'user_id', user)
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
