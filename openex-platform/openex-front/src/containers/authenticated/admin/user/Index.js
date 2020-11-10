import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import * as R from 'ramda'
import {T} from '../../../../components/I18n'
import {i18nRegister} from '../../../../utils/Messages'
import * as Constants from '../../../../constants/ComponentTypes'
import {fetchUsers} from '../../../../actions/User'
import {fetchOrganizations} from '../../../../actions/Organization'
import {List} from '../../../../components/List'
import {AvatarListItem, AvatarHeaderItem} from '../../../../components/list/ListItem'
import {Avatar} from '../../../../components/Avatar'
import {Icon} from '../../../../components/Icon'
import {SearchField} from '../../../../components/SimpleTextField'
import CreateUser from './CreateUser'
import UserPopover from './UserPopover'

i18nRegister({
  fr: {
    'Users management': 'Gestion des utilisateurs',
    'Name': 'Nom',
    'Email address': 'Adresse email',
    'Organization': 'Organisation',
    'Administrator': 'Administrateur',
    'Planner': 'Planificateur'
  }
})

const styles = {
  'search': {
    float: 'right',
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
      width: '20%',
      fontSize: '12px',
      textTransform: 'uppercase',
      fontWeight: '700'
    },
    'user_email': {
      float: 'left',
      width: '30%',
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
      textAlign: 'center',
      float: 'left',
      width: '10%',
      fontSize: '12px',
      textTransform: 'uppercase',
      fontWeight: '700'
    },
    'user_planificateur': {
      textAlign: 'center',
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
    width: '20%',
    padding: '5px 0 0 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  'mail': {
    float: 'left',
    width: '30%',
    padding: '5px 0 0 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  'org': {
    float: 'left',
    width: '25%',
    padding: '5px 0 0 0',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  'admin': {
    float: 'left',
    textAlign: 'center',
    width: '10%',
    padding: '5px 0 0 0'
  },
  'planificateur': {
    float: 'left',
    textAlign: 'center',
    width: '10%',
    padding: '5px 0 0 0'
  }
}

class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {sortBy: 'user_firstname', orderAsc: true, searchTerm: ''}
  }

  componentDidMount() {
    this.props.fetchUsers()
    this.props.fetchOrganizations()
  }

  handleSearchUsers(event, value) {
    this.setState({searchTerm: value})
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
    const keyword = this.state.searchTerm
    let filterByKeyword = n => keyword === '' ||
    n.user_email.toLowerCase().indexOf(keyword.toLowerCase()) !== -1 ||
    n.user_firstname.toLowerCase().indexOf(keyword.toLowerCase()) !== -1 ||
    n.user_lastname.toLowerCase().indexOf(keyword.toLowerCase()) !== -1

    const users = R.pipe(
      R.values(),
      R.filter(filterByKeyword),
      R.sort((a, b) => { //TODO replace with sortWith after Ramdajs new release
        var fieldA = R.toLower(R.propOr('', this.state.sortBy, a).toString())
        var fieldB = R.toLower(R.propOr('', this.state.sortBy, b).toString())
        return this.state.orderAsc ? this.ascend(fieldA, fieldB) : this.descend(fieldA, fieldB)
      })
    )(this.props.users)

    return <div>
      <div style={styles.title}><T>Users management</T></div>
      <div style={styles.search}>
        <SearchField name="keyword" fullWidth={true} type="text" hintText="Search"
                     onChange={this.handleSearchUsers.bind(this)}
                     styletype={Constants.FIELD_TYPE_RIGHT}/>
      </div>
      <div className="clearfix"></div>
      <List>
        <AvatarHeaderItem leftAvatar={<span style={styles.header.avatar}>#</span>}
                          rightIconButton={<Icon style={{display: 'none'}}/>} primaryText={<div>
          {this.SortHeader('user_firstname', 'Name')}
          {this.SortHeader('user_email', 'Email address')}
          {this.SortHeader('user_organization', 'Organization')}
          {this.SortHeader('user_admin', 'Administrator')}
          {this.SortHeader('user_planificateur', 'Planner')}
          <div className="clearfix"></div>
        </div>}/>

        {R.take(20, users).map(user => {
          let user_id = R.propOr(Math.random(), 'user_id', user)
          let user_firstname = R.propOr('-', 'user_firstname', user)
          let user_lastname = R.propOr('-', 'user_lastname', user)
          let user_email = R.propOr('-', 'user_email', user)
          let user_gravatar = R.propOr('', 'user_gravatar', user)
          let user_admin = R.propOr('-', 'user_admin', user)
          let user_planificateur = R.propOr('-', 'user_planificateur', user)
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
                  <Icon name={Constants.ICON_NAME_ACTION_CHECK_CIRCLE}/> :
                  <Icon name={Constants.ICON_NAME_CONTENT_REMOVE_CIRCLE}/>}</div>
                <div style={styles.planificateur}>{user_planificateur ?
                  <Icon name={Constants.ICON_NAME_ACTION_CHECK_CIRCLE}/> :
                  <Icon name={Constants.ICON_NAME_CONTENT_REMOVE_CIRCLE}/>}</div>
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
