import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import R from 'ramda'
import {T} from '../../../../../components/I18n'
import {i18nRegister} from '../../../../../utils/Messages'
import {timeDiff} from '../../../../../utils/Time'
import * as Constants from '../../../../../constants/ComponentTypes'
import {fetchUsers} from '../../../../../actions/User'
import {fetchOrganizations} from '../../../../../actions/Organization'
import {fetchAudiences} from '../../../../../actions/Audience'
import {fetchSubaudiences} from '../../../../../actions/Subaudience'
import {fetchComchecks} from '../../../../../actions/Comcheck'
import {FlatButton, LinkIconButton} from '../../../../../components/Button'
import {Toolbar, ToolbarTitle} from '../../../../../components/Toolbar'
import {Dialog} from '../../../../../components/Dialog'
import Theme from '../../../../../components/Theme'
import {List} from '../../../../../components/List'
import {AvatarListItem, AvatarHeaderItem} from '../../../../../components/list/ListItem';
import {Avatar} from '../../../../../components/Avatar'
import {Icon} from '../../../../../components/Icon'
import {SearchField} from '../../../../../components/SimpleTextField'
import SubaudienceNav from './SubaudienceNav'
import AudiencePopover from './AudiencePopover'
import SubaudiencePopover from './SubaudiencePopover'
import AddUsers from './AddUsers'
import UserPopover from './UserPopover'
import UserView from './UserView'

i18nRegister({
  fr: {
    'Name': 'Nom',
    'Email address': 'Adresse email',
    'Organization': 'Organisation',
    'You do not have any audiences in this exercise.': 'Vous n\'avez aucune audience dans cet exercice.',
    'This audience is empty.': 'Cette audience est vide.',
    'This sub-audience is empty.': 'Cette sous-audience est vide.',
    'Comcheck currently running': 'Comcheck en cours',
    'User view': 'Vue de l\'utilisateur',
    'user(s)': 'utilisateur(s)'
  }
})

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
    fontSize: '13px',
    textTransform: 'uppercase'
  },
  'empty': {
    marginTop: 30,
    fontSize: '18px',
    fontWeight: 500,
    textAlign: 'center'
  },
  'search': {
    float: 'right',
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
  'comcheck': {
    float: 'left',
    margin: '-16px 0px 0px -15px'
  },
  'users': {
    float: 'left',
    fontSize: '12px',
    color: Theme.palette.accent3Color
  }
}

class IndexAudience extends Component {
  constructor(props) {
    super(props);
    this.state = {sortBy: 'user_firstname', orderAsc: true, searchTerm: '', openView: false, currentUser: {}}
  }

  componentDidMount() {
    this.props.fetchAudiences(this.props.exerciseId)
    this.props.fetchSubaudiences(this.props.exerciseId)
    this.props.fetchUsers()
    this.props.fetchOrganizations()
    this.props.fetchComchecks(this.props.exerciseId)
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

  switchColor(disabled) {
    if (disabled) {
      return Theme.palette.disabledColor
    } else {
      return Theme.palette.textColor
    }
  }

  handleOpenView(user) {
    this.setState({currentUser: user, openView: true})
  }

  handleCloseView() {
    this.setState({openView: false})
  }

  render() {
    const viewActions = [
      <FlatButton label="Close" primary={true} onTouchTap={this.handleCloseView.bind(this)}/>,
    ]

    let comchecks = null
    if (this.props.comchecks.length > 0) {
      comchecks = (
        <div style={styles.comcheck}>
          <LinkIconButton
            to={'/private/exercise/' + this.props.exerciseId + '/checks/comcheck/' + this.props.comchecks[0].comcheck_id}
            tooltip="Comcheck currently running"
            toolti  pPosition="bottom-left"><Icon color="#E91E63"
                                                name={Constants.ICON_NAME_NOTIFICATION_NETWORK_CHECK}/></LinkIconButton>
        </div>
      )
    }

    let {exerciseId, audienceId, audience, subaudience, subaudiences} = this.props
    let audience_name = R.propOr('-', 'audience_name', audience)

    if (audience && subaudience) {
      const keyword = this.state.searchTerm
      let filterByKeyword = n => keyword === '' ||
      n.user_email.toLowerCase().indexOf(keyword.toLowerCase()) !== -1 ||
      n.user_firstname.toLowerCase().indexOf(keyword.toLowerCase()) !== -1 ||
      n.user_lastname.toLowerCase().indexOf(keyword.toLowerCase()) !== -1

      const users = R.pipe(
        R.map(data => R.pathOr({}, ['users', data.user_id], this.props)),
        R.filter(filterByKeyword),
        R.sort((a, b) => { //TODO replace with sortWith after Ramdajs new release
          var fieldA = R.toLower(R.propOr('', this.state.sortBy, a))
          var fieldB = R.toLower(R.propOr('', this.state.sortBy, b))
          return this.state.orderAsc ? this.ascend(fieldA, fieldB) : this.descend(fieldA, fieldB)
        })
      )(subaudience.subaudience_users)

      return <div style={styles.container}>
        <SubaudienceNav selectedSubaudience={subaudience.subaudience_id} exerciseId={exerciseId} audienceId={audienceId} audience={audience} subaudiences={subaudiences}/>
        <div>
          <div style={styles.title}><span
            style={{color: this.switchColor(!audience.audience_enabled || !subaudience.subaudience_enabled)}}>{subaudience.subaudience_name}</span></div>
          <SubaudiencePopover exerciseId={exerciseId} audienceId={audienceId} audience={audience} subaudience={subaudience} subaudiences={this.props.subaudiences}/>
          <div style={styles.users}>{subaudience.subaudience_users.length} <T>user(s)</T></div>
          <div style={styles.search}>
            <SearchField name="keyword" fullWidth={true} type="text" hintText="Search"
                         onChange={this.handleSearchUsers.bind(this)}
                         styletype={Constants.FIELD_TYPE_RIGHT}/>
          </div>
          <div className="clearfix"></div>
          <List>
            {subaudience.subaudience_users.length === 0 ? (
                <div style={styles.empty}><T>This sub-audience is empty.</T></div>
              ) : (
                <AvatarHeaderItem leftAvatar={<span style={styles.header.avatar}><span
                  style={{color: this.switchColor(!audience.audience_enabled || !subaudience.subaudience_enabled)}}>#</span></span>}
                                  rightIconButton={<Icon style={{display: 'none'}}/>} primaryText={<div>
                  <span
                    style={{color: this.switchColor(!audience.audience_enabled || !subaudience.subaudience_enabled)}}>{this.SortHeader('user_firstname', 'Name')}</span>
                  <span
                    style={{color: this.switchColor(!audience.audience_enabled || !subaudience.subaudience_enabled)}}>{this.SortHeader('user_email', 'Email address')}</span>
                  <span
                    style={{color: this.switchColor(!audience.audience_enabled || !subaudience.subaudience_enabled)}}>{this.SortHeader('user_organization', 'Organization')}</span>
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
              return <AvatarListItem
                key={userId}
                onClick={this.handleOpenView.bind(this, user)}
                leftAvatar={<Avatar type={Constants.AVATAR_TYPE_MAINLIST} src={user_gravatar}/>}
                rightIconButton={<UserPopover exerciseId={exerciseId} audience={audience} subaudience={subaudience} user={user}/>}
                primaryText={
                  <div>
                    <div style={styles.name}><span
                      style={{color: this.switchColor(!audience.audience_enabled || !subaudience.subaudience_enabled)}}>{user_firstname} {user_lastname}</span>
                    </div>
                    <div style={styles.mail}><span
                      style={{color: this.switchColor(!audience.audience_enabled || !subaudience.subaudience_enabled)}}>{user_email}</span></div>
                    <div style={styles.org}><span
                      style={{color: this.switchColor(!audience.audience_enabled || !subaudience.subaudience_enabled)}}>{organizationName}</span></div>
                    <div className="clearfix"></div>
                  </div>
                }
              />
            })}
          </List>
          <Toolbar type={Constants.TOOLBAR_TYPE_EVENT}>
            <ToolbarTitle type={Constants.TOOLBAR_TYPE_EVENT} text={audience_name}/>
            <AudiencePopover exerciseId={exerciseId} audienceId={audienceId} audience={audience}/>
            {comchecks}
          </Toolbar>
          <Dialog
            title="User view"
            modal={false}
            open={this.state.openView}
            autoScrollBodyContent={true}
            onRequestClose={this.handleCloseView.bind(this)}
            actions={viewActions}>
            <UserView user={this.state.currentUser} />
          </Dialog>
          <AddUsers exerciseId={exerciseId} audienceId={audienceId} subaudienceId={subaudience.subaudience_id}
                    subaudienceUsersIds={subaudience.subaudience_users.map(u => u.user_id)}/>
        </div>
      </div>
    } else if (audience) {
      return <div style={styles.container}>
        <SubaudienceNav exerciseId={exerciseId} audienceId={audienceId} audience={audience} subaudiences={subaudiences}/>
        <div style={styles.empty}><T>This audience is empty.</T></div>
        <Toolbar type={Constants.TOOLBAR_TYPE_EVENT}>
          <ToolbarTitle type={Constants.TOOLBAR_TYPE_EVENT} text={audience_name}/>
          <AudiencePopover exerciseId={exerciseId} audienceId={audienceId} audience={audience}/>
          {comchecks}
        </Toolbar>
      </div>
    } else {
      return <div style={styles.container}></div>
    }
  }
}

IndexAudience.propTypes = {
  exerciseId: PropTypes.string,
  audienceId: PropTypes.string,
  users: PropTypes.object,
  organizations: PropTypes.object,
  audience: PropTypes.object,
  audiences: PropTypes.array,
  subaudience: PropTypes.object,
  subaudiences: PropTypes.array,
  comchecks: PropTypes.array,
  fetchUsers: PropTypes.func,
  fetchAudiences: PropTypes.func,
  fetchSubaudiences: PropTypes.func,
  fetchOrganizations: PropTypes.func,
  fetchComchecks: PropTypes.func,
}

const filterAudiences = (audiences, exerciseId) => {
  let audiencesFilterAndSorting = R.pipe(
    R.values,
    R.filter(n => n.audience_exercise.exercise_id === exerciseId),
    R.sort((a, b) => a.audience_name.localeCompare(b.audience_name))
  )
  return audiencesFilterAndSorting(audiences)
}

const filterSubaudiences = (subaudiences, audienceId) => {
  let subaudiencesFilterAndSorting = R.pipe(
    R.values,
    R.filter(n => n.subaudience_audience.audience_id === audienceId),
    R.sort((a, b) => a.subaudience_name.localeCompare(b.subaudience_name))
  )
  return subaudiencesFilterAndSorting(subaudiences)
}

const filterComchecks = (comchecks, audienceId) => {
  let comchecksFilterAndSorting = R.pipe(
    R.values,
    R.filter(n => n.comcheck_audience.audience_id === audienceId && !n.comcheck_finished),
    R.sort((a, b) => timeDiff(a.comcheck_end_date, b.comcheck_end_date))
  )
  return comchecksFilterAndSorting(comchecks)
}

const select = (state, ownProps) => {
  let exerciseId = ownProps.params.exerciseId
  let audienceId = ownProps.params.audienceId
  let audience = R.prop(audienceId, state.referential.entities.audiences)
  let audiences = filterAudiences(state.referential.entities.audiences, exerciseId)
  let subaudiences = filterSubaudiences(state.referential.entities.subaudiences, audienceId)
  let comchecks = filterComchecks(state.referential.entities.comchecks, audienceId)

  //region get default incident
  let stateCurrentSubaudience = R.path(['exercise', exerciseId, 'audience', audienceId, 'current_subaudience'], state.screen)
  let subaudienceId = stateCurrentSubaudience === undefined && subaudiences.length > 0 ? R.head(subaudiences).subaudience_id : stateCurrentSubaudience //Force a default subaudience if needed
  let subaudience = subaudienceId ? R.find(a => a.subaudience_id === subaudienceId)(subaudiences) : undefined
  //endregion

  return {
    exerciseId,
    audienceId,
    audience,
    audiences,
    subaudience,
    subaudiences,
    comchecks,
    users: state.referential.entities.users,
    organizations: state.referential.entities.organizations,
  }
}

export default connect(select, {
  fetchUsers,
  fetchAudiences,
  fetchSubaudiences,
  fetchOrganizations,
  fetchComchecks
})(IndexAudience);
