import React, {Component, PropTypes} from 'react'
import createImmutableSelector from '../../../utils/ImmutableSelect'
import {connect} from 'react-redux'
import {fromJS} from 'immutable'
import R from 'ramda'
import {fetchUsers} from '../../../actions/User'
import {CircularSpinner} from '../../../components/Spinner'
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';
import {Avatar} from '../../../components/Avatar';

class Index extends Component {
  componentDidMount() {
    this.props.fetchUsers();
  }

  render() {
    return (
      <div>
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
            {this.props.users.toList().map(user => {
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
  users: PropTypes.object,
  fetchUsers: PropTypes.func.isRequired
}

//Users selector extract only the fields use to render the Home Page.
const usersSelector = state => {
  const users = state.application.getIn(['entities', 'users']).toJS()
  var fields = R.compose(R.dissoc('user_groups'));
  return fromJS(R.map(fields, users))
}
const cleanedUsers = createImmutableSelector(usersSelector, users => users)

const select = (state) => {
  return {
    users: cleanedUsers(state),
  }
}

export default connect(select, {fetchUsers})(Index);