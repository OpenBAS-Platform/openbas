import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {toggleLeftBar, logout} from '../../actions/Application'
import {AppBar} from '../../components/AppBar'
import {Avatar} from '../../components/Avatar'
import {Popover} from '../../components/Popover'
import {Menu} from '../../components/Menu'
import {MenuItemLink, MenuItemButton} from "../../components/menu/MenuItem"

import NavBar from '../../components/NavBar'
import LeftBar from '../../components/LeftBar'

const styles = {
  root: {
    padding: '20px 20px 0 85px',
  },
  title: {
    marginLeft: 20
  },
  avatar: {
    cursor: 'pointer',
    marginTop: 5,
    marginRight: 8
  }
}

class RootAuthenticated extends Component {
  constructor(props) {
    super(props);

    this.state = {
      menu_right_open: false,
    }
  }

  toggleLeftBar() {
    this.props.toggleLeftBar()
  }

  openRightMenu(event) {
    event.preventDefault()

    this.setState({
      menu_right_open: true,
      anchorEl: event.currentTarget,
    })
  }

  closeRightMenu() {
    this.setState({
      menu_right_open: false,
    })
  }

  logout() {
    this.props.logout()
  }

  render() {
    return (
      <div>
        <AppBar
          title="OpenEx"
          titleStyle={styles.title}
          onLeftIconButtonTouchTap={this.toggleLeftBar.bind(this)}
          iconElementRight={
            <div>
              <Avatar
                src={this.props.userGravatar}
                style={styles.avatar}
                onTouchTap={this.openRightMenu.bind(this)}
              />
              <Popover
                open={this.state.menu_right_open}
                anchorEl={this.state.anchorEl}
                anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
                targetOrigin={{horizontal: 'left', vertical: 'top'}}
                onRequestClose={this.closeRightMenu.bind(this)}>
                <Menu multiple={false}>
                  <MenuItemLink label="Profile" to="/profile"/>
                  <MenuItemButton label="Sign out" onClick={this.logout.bind(this)}/>
                </Menu>
              </Popover>
            </div>
          }
        />
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
  userGravatar: PropTypes.string,
  toggleLeftBar: PropTypes.func,
  logout: PropTypes.func,
  children: React.PropTypes.node
}

const select = (state) => {
  var userId = state.application.get('user')
  const userFirstname = state.application.getIn(['entities', 'users', userId, 'user_firstname'])
  const userGravatar = state.application.getIn(['entities', 'users', userId, 'user_gravatar'])
  return {
    userFirstname: userFirstname,
    userGravatar: userGravatar
  }
}

export default connect(select, {toggleLeftBar, logout})(RootAuthenticated)