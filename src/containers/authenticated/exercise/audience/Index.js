import React, {Component, PropTypes} from 'react'
import {connect} from 'react-redux'
import {fetchUsers} from '../../../../actions/User'
import {Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn} from 'material-ui/Table';
import {Avatar} from '../../../../components/Avatar';
import AudienceNav from './AudienceNav';

const styles = {
  'container': {
    paddingRight: '300px',
  }
}

class Index extends Component {
  componentDidMount() {
    this.props.fetchUsers();
  }

  changeAudience(audience) {
    this.setState({audience: audience})
  }

  render() {
    return (
      <div style={styles.container}>
        <AudienceNav id={this.props.id}/>
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

          </TableBody>
        </Table>
      </div>
    );
  }
}

Index.propTypes = {
  id: PropTypes.string,
  users: PropTypes.object,
  audiences: PropTypes.object,
  fetchUsers: PropTypes.func.isRequired,
}

const select = (state, ownProps) => {
  let exerciseId = ownProps.params.exerciseId
  return {
    id: exerciseId,
    users: state.application.getIn(['entities', 'users']),
    audiences: state.application.getIn(['entities', 'audiences']),
  }
}

export default connect(select, {fetchUsers})(Index);