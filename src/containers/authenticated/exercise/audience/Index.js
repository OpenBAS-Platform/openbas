import React, {Component, PropTypes} from 'react'
import {Map} from 'immutable'
import {connect} from 'react-redux'
import * as Constants from '../../../../constants/ComponentTypes'
import {fetchUsers} from '../../../../actions/User'
import {fetchOrganizations} from '../../../../actions/Organization'
import {List} from '../../../../components/List'
import {MainListItem} from '../../../../components/list/ListItem';
import {Avatar} from '../../../../components/Avatar'
import AudienceNav from './AudienceNav'
import AudiencePopover from './AudiencePopover'
import AddUsers from './AddUsers'
import UserPopover from './UserPopover'

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
  },
  'popover': {
    float: 'left',
    padding: '17px 0 0 0'
  }
}

class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedUsers: [],
    }
    this.selectedUsers = []
  }

  componentDidMount() {
    this.props.fetchUsers()
    this.props.fetchOrganizations()
  }

  render() {
    if (this.props.audience.get('audience_id') === undefined) {
      return (
        <div style={styles.container}>
          <AudienceNav exerciseId={this.props.exerciseId}/>
          <div style={styles.empty}>No audience selected.</div>
        </div>
      )
    }

    return (
      <div style={styles.container}>
        <AudienceNav exerciseId={this.props.exerciseId}/>
        <div style={styles.title}>{this.props.audience.get('audience_name')}</div>
        <AudiencePopover exerciseId={this.props.exerciseId} audienceId={this.props.audience.get('audience_id')}/>
        <div style={styles.number}>{this.props.audience_users.count()} users</div>
        <div className="clearfix"></div>
        {this.props.audience_users.count() === 0 ? <div style={styles.empty}>This audience is empty.</div>:""}
        <List>
          {this.props.audience_users.toList().map(userId => {
            let user = this.props.users.get(userId)
            let organizationName = ''
            if (user.get('user_organization') && this.props.organizations) {
              organizationName = this.props.organizations.get(user.get('user_organization')).get('organization_name')
            }
            return (
              <MainListItem
                key={user.get('user_id')}
                leftAvatar={<Avatar type={Constants.AVATAR_TYPE_MAINLIST} src={user.get('user_gravatar')}/>}
                rightIconButton={
                  <div style={styles.popover}>
                    <UserPopover exerciseId={this.props.exerciseId}
                                 audienceId={this.props.audience.get('audience_id')}
                                 userId={user.get('user_id')}/>
                  </div>
                }
                primaryText={
                  <div>
                    <div style={styles.name}>{user.get('user_firstname')} {user.get('user_lastname')}</div>
                    <div style={styles.mail}>{user.get('user_email')}</div>
                    <div style={styles.org}>{organizationName}</div>
                    <div className="clearfix"></div>
                  </div>
                }
              />
            )
          })}
        </List>
        <AddUsers exerciseId={this.props.exerciseId} audienceId={this.props.audience.get('audience_id')}
                  audienceUsersIds={this.props.audience_users_ids}/>
      </div>
    );
  }
}

Index.propTypes = {
  exerciseId: PropTypes.string,
  users: PropTypes.object,
  organizations: PropTypes.object,
  audience: PropTypes.object,
  audience_users: PropTypes.object,
  audience_users_ids: PropTypes.object,
  fetchUsers: PropTypes.func,
  fetchOrganizations: PropTypes.func,
}

const select = (state, ownProps) => {
  let exerciseId = ownProps.params.exerciseId
  let audiences = state.application.getIn(['entities', 'audiences'])
  let currentAudience = state.application.getIn(['ui', 'states', 'current_audiences', exerciseId])
  let audience = currentAudience ? audiences.get(currentAudience) : Map()
  let audienceUsers = currentAudience ? audiences.get(currentAudience).get('audience_users') : Map()
  let audienceUsersIds = audienceUsers.toList()

  return {
    exerciseId,
    audience,
    users: state.application.getIn(['entities', 'users']),
    organizations: state.application.getIn(['entities', 'organizations']),
    audience_users: audienceUsers,
    audience_users_ids: audienceUsersIds
  }
}

export default connect(select, {fetchUsers, fetchOrganizations})(Index);