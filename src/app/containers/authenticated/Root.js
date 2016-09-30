import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {logout} from '../../actions/Application';
import TopBar from '../../components/TopBar'
import NavBar from '../../components/NavBar'
import LeftBar from '../../components/LeftBar'

const styles = {
  root: {
    padding: '20px 20px 0 85px'
  }
}

class RootAuthenticated extends Component {
  render() {
    return (
      <div>
        <TopBar />
        <NavBar />
        <LeftBar />
        <div style={styles.root}>
          {this.props.children}
        </div>
      </div>
    )
  }
}

RootAuthenticated.propTypes = {
  userFirstname: PropTypes.string,
  children: React.PropTypes.node
}

const select = (state) => {
  var userId = state.application.get('user')
  const userFirstname = state.application.getIn(['entities', 'users', userId, 'user_firstname'])
  return {
    userFirstname: userFirstname
  }
}

export default connect(select, {logout})(RootAuthenticated)