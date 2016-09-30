import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import logo from '../../logo.svg';
import {logout} from '../../actions/Application';
import {Button, LinkButton} from '../../components/Button'
import Menu from './Menu'
import TopBar from '../../components/TopBar'

class RootAuthenticated extends Component {
  logoutClick() {
    this.props.logout();
  }

  render() {
    return (
      <div className="App">
        <TopBar title="OpenEx" right={<Menu/>}/>
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo"/>
          <h2>Welcome to OpenEx {this.props.userFirstname}</h2>
        </div>
        <div>
          <LinkButton label="Index" to="/"/>
          <LinkButton label="Home" to="home"/>
          <Button label="Logout" onClick={this.logoutClick.bind(this)}/>
        </div>
        <div>
          {this.props.children}
        </div>
      </div>
    )
  }
}

RootAuthenticated.propTypes = {
  logout: PropTypes.func.isRequired,
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