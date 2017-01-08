import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import R from 'ramda'
import {T} from '../../../../components/I18n'
import {i18nRegister} from '../../../../utils/Messages'
import * as Constants from '../../../../constants/ComponentTypes'
import {fetchGroups} from '../../../../actions/Group'
import {fetchUsers} from '../../../../actions/User'
import {fetchOrganizations} from '../../../../actions/Organization'
import {fetchExercises} from '../../../../actions/Exercise'
import {List} from '../../../../components/List'
import {MainListItem, HeaderItem} from '../../../../components/list/ListItem';
import {Icon} from '../../../../components/Icon'
import CreateGroup from './CreateGroup'
import GroupPopover from './GroupPopover'

i18nRegister({
  fr: {
    'Groups management': 'Gestion des groupes',
    'Name': 'Nom',
    'Users': 'Utilisateurs'
  }
})

const styles = {
  'header': {
    'icon': {
      fontSize: '12px',
      textTransform: 'uppercase',
      fontWeight: '700',
      padding: '8px 0 0 8px'
    },
    'group_name': {
      float: 'left',
      width: '25%',
      fontSize: '12px',
      textTransform: 'uppercase',
      fontWeight: '700'
    },
    'group_users': {
      float: 'left',
      width: '25%',
      fontSize: '12px',
      textTransform: 'uppercase',
      textAlign: 'center',
      fontWeight: '700'
    },
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
  'users': {
    float: 'left',
    textAlign: 'center',
    width: '25%',
    padding: '5px 0 0 0'
  }
}

class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {sortBy: 'group_name', orderAsc: true}
  }

  componentDidMount() {
    this.props.fetchExercises()
    this.props.fetchUsers()
    this.props.fetchOrganizations()
    this.props.fetchGroups()
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

  //TODO replace with sortWith after Ramdajs new release
  ascend(a, b) {
    return a < b ? -1 : a > b ? 1 : 0;
  }

  descend(a, b) {
    return a > b ? -1 : a < b ? 1 : 0;
  }

  render() {
    const groups = R.pipe(
      R.values(),
      R.sort((a, b) => { //TODO replace with sortWith after Ramdajs new release
        var fieldA = R.toLower(R.propOr('', this.state.sortBy, a).toString())
        var fieldB = R.toLower(R.propOr('', this.state.sortBy, b).toString())
        return this.state.orderAsc ? this.ascend(fieldA, fieldB) : this.descend(fieldA, fieldB)
      })
    )(this.props.groups)

    return <div>
      <div style={styles.title}><T>Groups management</T></div>
      <div className="clearfix"></div>
      <List>
        <HeaderItem leftIcon={<span style={styles.header.icon}>#</span>}
                    rightIconButton={<Icon style={{display: 'none'}}/>} primaryText={<div>
          {this.SortHeader('group_name', 'Name')}
          {this.SortHeader('group_users', 'Users')}
          <div className="clearfix"></div>
        </div>}/>

        {groups.map(group => {
          let group_id = R.propOr(Math.random(), 'group_id', group)
          let group_name = R.propOr('-', 'group_name', group)
          let group_users = R.propOr([], 'group_users', group)

          return <MainListItem
            key={group_id}
            leftIcon={<Icon name={Constants.ICON_NAME_SOCIAL_PUBLIC} type={Constants.ICON_TYPE_MAINLIST}/>}
            rightIconButton={<GroupPopover group={group} groupUsersIds={group.group_users.map(u => u.user_id)}
                                           organizations={this.props.organizations} users={this.props.users}
                                           exercises={this.props.exercises}/>}
            primaryText={
              <div>
                <div style={styles.name}>{group_name}</div>
                <div style={styles.users}>{group_users.length}</div>
                <div className="clearfix"></div>
              </div>
            }
          />
        })}
      </List>
      <CreateGroup/>
    </div>
  }
}

Index.propTypes = {
  groups: PropTypes.object,
  organizations: PropTypes.object,
  exercises: PropTypes.object,
  users: PropTypes.object,
  fetchUsers: PropTypes.func,
  fetchOrganizations: PropTypes.func,
  fetchExercises: PropTypes.func,
  fetchGroups: PropTypes.func,
}

const select = (state) => {
  return {
    groups: state.referential.entities.groups,
    exercises: state.referential.entities.exercises,
    users: state.referential.entities.users,
    organizations: state.referential.entities.organizations,
  }
}

export default connect(select, {fetchGroups, fetchExercises, fetchUsers, fetchOrganizations})(Index);