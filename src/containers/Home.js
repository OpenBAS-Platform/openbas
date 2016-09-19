import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {fetchUsers} from '../actions/User';
import CircularProgress from 'material-ui/CircularProgress';

class Home extends Component {
  componentDidMount() {
    this.props.fetchUsers();
  }

  render() {
    let loading;
    if (this.props.loading) {
      loading = <CircularProgress />
    }

    return (
      <div>
        { loading }
        {this.props.users.toList().map(user => {
          return (
            <div key={user.get('user_id')}>User : {user.get('user_firstname')}</div>
          )
        })}
      </div>
    );
  }
}

Home.propTypes = {
  loading: PropTypes.bool.isRequired,
  users: PropTypes.object,
  fetchUsers: PropTypes.func.isRequired
}

const select = (state) => {
  return {
    users: state.application.getIn(['entities', 'users']),
    loading: state.home.get('loading')
  }
}

export default connect(select, {fetchUsers})(Home);