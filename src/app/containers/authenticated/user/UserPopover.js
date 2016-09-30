import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import {Popover} from '../../../components/Popover';
import {Avatar} from '../../../components/Avatar';
import {Menu} from '../../../components/Menu'
import {MenuItemLink, MenuItemButton} from "../../../components/menu/MenuItem"
import {logout} from '../../../actions/Application'

class UserPopover extends Component {
  constructor(props) {
    super(props);
    this.state = {open: false}
  }

  handleOpen(event) {
    event.preventDefault()
    this.setState({
      open: true,
      anchorEl: event.currentTarget,
    })
  }

  handleClose() {
    this.setState({open: false})
  }

  logoutClick() {
    console.log(this.props)
    this.props.logout()
  }

  render() {
    return (
      <div>
        <Avatar src={this.props.userGravatar} onTouchTap={this.handleOpen.bind(this)}/>
        <Popover open={this.state.open}
                 anchorEl={this.state.anchorEl}
                 onRequestClose={this.handleClose.bind(this)}>
          <Menu multiple={false}>
            <MenuItemLink label="Profile" to="/profile"/>
            <MenuItemButton label="Sign out" onClick={this.logoutClick.bind(this)}/>
          </Menu>
        </Popover>
      </div>
    )
  }
}

UserPopover.propTypes = {
  userGravatar: PropTypes.string,
  logout: PropTypes.func,
  children: PropTypes.node
}

const select = (state) => {
  var userId = state.application.get('user')
  const userGravatar = state.application.getIn(['entities', 'users', userId, 'user_gravatar'])
  return {
    userGravatar: userGravatar
  }
}

export default connect(select, {logout})(UserPopover)