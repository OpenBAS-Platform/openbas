import React, {PropTypes, Component} from 'react';
import AppBar from 'material-ui/AppBar';
import {connect} from 'react-redux';
import {toggleLeftBar, logout} from '../actions/Application'
import Avatar from "material-ui/Avatar"
import Popover from "material-ui/Popover"
import Menu from "material-ui/Menu"
import {MenuItemLink, MenuItemButton} from "../components/menu/MenuItem"

const styles = {
  title: {
    marginLeft: 20
  },
  avatar: {
    cursor: 'pointer',
    marginTop: 5,
    marginRight: 8
  }
}

class TopBar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      open: false,
    }
  }

  logoutClick() {
    this.props.logout()
  }

  avatarClick(event) {
    event.preventDefault()

    this.setState({
      open: true,
      anchorEl: event.currentTarget,
    })
  }

  requestClose() {
    this.setState({
      open: false,
    });
  }

  leftClick() {
    this.props.toggleLeftBar()
  }

  render() {
    return (
      <AppBar
        title="OpenEx"
        titleStyle={styles.title}
        onLeftIconButtonTouchTap={this.leftClick.bind(this)}
        iconElementRight={
          <div>
            <Avatar src={this.props.userGravatar} style={styles.avatar} onTouchTap={this.avatarClick.bind(this)}/>
            <Popover
              open={this.state.open}
              anchorEl={this.state.anchorEl}
              anchorOrigin={{horizontal: 'left', vertical: 'bottom'}}
              targetOrigin={{horizontal: 'left', vertical: 'top'}}
              onRequestClose={this.requestClose.bind(this)}>
              <Menu>
                <MenuItemLink label="Profile" to="/profile"/>
                <MenuItemButton label="Sign out" onClick={this.logoutClick.bind(this)}/>
              </Menu>
            </Popover>
          </div>
        }
      />
    )
  }
}

TopBar.propTypes = {
  logout: PropTypes.func,
  toggleLeftBar: PropTypes.func,
  userGravatar: PropTypes.string
}

const select = (state) => {
  var userId = state.application.get('user')
  const userGravatar = state.application.getIn(['entities', 'users', userId, 'user_gravatar'])
  return {
    userGravatar: userGravatar
  }
}

export default connect(select, {toggleLeftBar, logout})(TopBar)