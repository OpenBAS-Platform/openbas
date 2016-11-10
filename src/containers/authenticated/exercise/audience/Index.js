import React, {Component, PropTypes} from 'react'
import {Map} from 'immutable'
import {connect} from 'react-redux'
import R from 'ramda'
import {fetchUsers} from '../../../../actions/User'
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table'
import {Avatar} from '../../../../components/Avatar'
import AudienceNav from './AudienceNav'
import AudiencePopover from './AudiencePopover'
import AddUsers from './AddUsers'

const styles = {
  'container': {
    paddingRight: '300px',
  },
  'title': {
    float: 'left',
    fontSize: '18px',
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
    this.props.fetchUsers();
  }

  handleRowSelection(rowList) {
    console.log(rowList)
    if (rowList === 'all') {
      this.selectedUsers = this.props.audience_users_ids.toJS()
    } else if (rowList === 'none') {
      this.selectedUsers = []
    } else {
      this.selectedUsers = R.map(index => this.props.audience_users_ids.get(index), rowList)
    }

    if (this.selectedUsers.length > 0) {

    }
  }

  handleDeletion() {

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
        <Table selectable={true} multiSelectable={true} onRowSelection={this.handleRowSelection.bind(this)}>
          <TableHeader>
            <TableRow>
              <TableHeaderColumn>Name</TableHeaderColumn>
              <TableHeaderColumn>Email</TableHeaderColumn>
              <TableHeaderColumn>Organization</TableHeaderColumn>
              <TableHeaderColumn>Avatar</TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody deselectOnClickaway={false} showRowHover={true} stripedRows={true}>
            {this.props.audience_users.toList().map(userId => {
              let user = this.props.users.get(userId)
              let organizationName = ''
              if( user.get('user_organization') && this.props.organizations ) {
                organizationName = this.props.organizations.get(user.get('user_organization')).get('organization_name')
              }

              return (
                <TableRow hoverable={true} key={user.get('user_id')}>
                  <TableRowColumn>{user.get('user_firstname')} {user.get('user_lastname')}</TableRowColumn>
                  <TableRowColumn>{user.get('user_email')}</TableRowColumn>
                  <TableRowColumn>{organizationName}</TableRowColumn>
                  <TableRowColumn>
                    <Avatar src={user.get('user_gravatar')}/>
                  </TableRowColumn>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
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

export default connect(select, {fetchUsers})(Index);