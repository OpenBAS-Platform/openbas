import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import R from 'ramda'
import * as Constants from '../../../../constants/ComponentTypes'
import {fetchUsers} from '../../../../actions/User'
import {fetchOrganizations} from '../../../../actions/Organization'
import {List} from '../../../../components/List'
import {AvatarListItem, AvatarHeaderItem} from '../../../../components/list/ListItem';
import {Avatar} from '../../../../components/Avatar'
import {Icon} from '../../../../components/Icon'
import CreateUser from './CreateUser'
import UserPopover from './UserPopover'

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
      width: '25%',
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
      width: '25%',
      fontSize: '12px',
      textTransform: 'uppercase',
      fontWeight: '700'
    },
    'user_admin': {
      float: 'left',
      width: '10%',
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
    width: '25%',
    padding: '5px 0 0 0'
  },
  'mail': {
    float: 'left',
    width: '35%',
    padding: '5px 0 0 0'
  },
  'org': {
    float: 'left',
    width: '25%',
    padding: '5px 0 0 0'
  },
  'admin': {
    float: 'left',
    padding: '5px 0 0 0'
  }
}

class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {sortBy: 'user_firstname', orderAsc: true}
  }

  componentDidMount() {
    this.props.fetchUsers()
    this.props.fetchOrganizations()
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
    return <div>
      <div style={styles.title}>Users management</div>
      <div className="clearfix"></div>
      <List>
        <AvatarHeaderItem leftAvatar={<span style={styles.header.avatar}>#</span>}
                          rightIconButton={<Icon style={{display: 'none'}}/>} primaryText={<div>
          {this.SortHeader('user_firstname', 'name')}
          {this.SortHeader('user_email', 'Email address')}
          {this.SortHeader('user_organization', 'Organization')}
          {this.SortHeader('user_admin', 'Administrator')}
          <div className="clearfix"></div>
        </div>}/>

        {R.values(this.props.users).map(user => {
          let user_id = R.propOr(Math.random(), 'user_id', user)
          let user_firstname = R.propOr('-', 'user_firstname', user)
          let user_lastname = R.propOr('-', 'user_lastname', user)
          let user_email = R.propOr('-', 'user_email', user)
          let user_gravatar = R.propOr('', 'user_gravatar', user)
          let user_admin = R.propOr('-', 'user_admin', user)
          let user_organization = R.propOr({}, user.user_organization, this.props.organizations)
          let organizationName = R.propOr('-', 'organization_name', user_organization)

          return <AvatarListItem
            key={user_id}
            leftAvatar={<Avatar type={Constants.AVATAR_TYPE_MAINLIST} src={user_gravatar}/>}
            rightIconButton={<UserPopover user={user}/>}
            primaryText={
              <div>
                <div style={styles.name}>{user_firstname} {user_lastname}</div>
                <div style={styles.mail}>{user_email}</div>
                <div style={styles.org}>{organizationName}</div>
                <div style={styles.admin}>{user_admin ?
                  <Icon name={Constants.ICON_NAME_ACTION_CHECK_CIRCLE} type={Constants.ICON_TYPE_MAINLIST_RIGHT}/> :
                  <Icon name={Constants.ICON_NAME_CONTENT_REMOVE_CIRCLE}
                        type={Constants.ICON_TYPE_MAINLIST_RIGHT}/>}</div>
                <div className="clearfix"></div>
              </div>
            }
          />
        })}
      </List>
      <CreateUser/>
    </div>
  }
}

Index.propTypes = {
  users: PropTypes.object,
  organizations: PropTypes.object,
  fetchUsers: PropTypes.func,
  fetchOrganizations: PropTypes.func
}

const select = (state) => {
  return {
    users: state.referential.entities.users,
    organizations: state.referential.entities.organizations,
  }
}

export default connect(select, {fetchUsers, fetchOrganizations})(Index);
