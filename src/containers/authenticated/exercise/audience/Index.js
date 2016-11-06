import React, {Component, PropTypes} from 'react'
import {Map} from 'immutable'
import {connect} from 'react-redux'
import {fetchUsers} from '../../../../actions/User'
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';
import {Avatar} from '../../../../components/Avatar';
import AudienceNav from './AudienceNav';
import AudiencePopover from './AudiencePopover';

const styles = {
  'container': {
    paddingRight: '300px',
  },
  'title': {
    float: 'left',
    fontSize: '18px',
    fontWeight: 600
  },
  'number': {
    float: 'right',
    color: '#9E9E9E',
    fontSize: '12px',
  }
}

class Index extends Component {
  componentDidMount() {
    this.props.fetchUsers();
  }

  render() {
    return (
      <div style={styles.container}>
        <AudienceNav id={this.props.id}/>
        <div style={styles.title}>{this.props.audience.get('audience_name')}</div><AudiencePopover />
        <div style={styles.number}>{this.props.audience_users.count()} users</div>
        <div className="clearfix"></div>
        <Table selectable={true} multiSelectable={true}>
          <TableHeader>
            <TableRow>
              <TableHeaderColumn>Name</TableHeaderColumn>
              <TableHeaderColumn>Email</TableHeaderColumn>
              <TableHeaderColumn>Organization</TableHeaderColumn>
              <TableHeaderColumn>Avatar</TableHeaderColumn>
            </TableRow>
          </TableHeader>
          <TableBody showRowHover={true}>
            {this.props.audience_users.toList().map(userId => {
              let user = this.props.users.get(userId)
              return (
                <TableRow hover={true} hoverable={true} key={user.get('user_id')}>
                  <TableRowColumn>{user.get('user_firstname')} {user.get('user_lastname')}</TableRowColumn>
                  <TableRowColumn>{user.get('user_email')}</TableRowColumn>
                  <TableRowColumn>ANSSI</TableRowColumn>
                  <TableRowColumn>
                    <Avatar src={user.get('user_gravatar')}/>
                  </TableRowColumn>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    );
  }
}

Index.propTypes = {
  id: PropTypes.string,
  users: PropTypes.object,
  audience: PropTypes.object,
  audience_users: PropTypes.object,
  fetchUsers: PropTypes.func.isRequired,
}

const select = (state, ownProps) => {
  let exerciseId = ownProps.params.exerciseId
  let audiences = state.application.getIn(['entities', 'audiences'])
  let currentAudience = state.application.getIn(['ui', 'states', 'current_audience'])
  let audience = currentAudience ? audiences.get(currentAudience) : Map()
  let audienceUsers = currentAudience ? audiences.get(currentAudience).get('audience_users') : Map()

  return {
    id: exerciseId,
    users: state.identity.getIn(['entities', 'users']),
    audience,
    audience_users: audienceUsers
  }
}

export default connect(select, {fetchUsers})(Index);