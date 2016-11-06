import React, {Component, PropTypes} from 'react'
import {Map} from 'immutable'
import {connect} from 'react-redux'
import {fetchUsers} from '../../../../actions/User'
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';
import {Avatar} from '../../../../components/Avatar';
import AudienceNav from './AudienceNav';
import AudiencePopover from './AudiencePopover';
import AddUsers from './AddUsers';

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
  componentDidMount() {
    this.props.fetchUsers();
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
        <AddUsers exerciseId={this.props.exerciseId} audienceId={this.props.audience.get('audience_id')} />
      </div>
    );
  }
}

Index.propTypes = {
  exerciseId: PropTypes.string,
  users: PropTypes.object,
  audience: PropTypes.object,
  audience_users: PropTypes.object,
  fetchUsers: PropTypes.func,
}

const select = (state, ownProps) => {
  let exerciseId = ownProps.params.exerciseId
  let audiences = state.application.getIn(['entities', 'audiences'])
  let currentAudience = state.application.getIn(['ui', 'states', 'current_audience'])
  let audience = currentAudience ? audiences.get(currentAudience) : Map()
  let audienceUsers = currentAudience ? audiences.get(currentAudience).get('audience_users') : Map()

  return {
    exerciseId,
    audience,
    users: state.application.getIn(['entities', 'users']),
    audience_users: audienceUsers
  }
}

export default connect(select, {fetchUsers})(Index);