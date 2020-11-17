import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import * as Constants from '../../constants/ComponentTypes';
import { Popover } from '../../components/Popover';
import { Avatar } from '../../components/Avatar';
import { Menu } from '../../components/Menu';
import { MenuItemLink, MenuItemButton } from '../../components/menu/MenuItem';
import { logout, fetchToken } from '../../actions/Application';
import { i18nRegister } from '../../utils/Messages';

i18nRegister({
  fr: {
    'Sign out': 'Se déconnecter',
    Profile: 'Profil',
    Admin: 'Admin',
  },
});

class UserPopover extends Component {
  constructor(props) {
    super(props);
    this.state = { open: false };
  }

  componentDidMount() {
    this.props.fetchToken();
  }

  handleOpen(event) {
    event.preventDefault();
    this.setState({
      open: true,
      anchorEl: event.currentTarget,
    });
  }

  handleClose() {
    this.setState({ open: false });
  }

  logoutClick() {
    this.handleClose();
    this.props.logout();
  }

  render() {
    return (
      <div>
        <Avatar
          src={this.props.userGravatar}
          onClick={this.handleOpen.bind(this)}
          type={Constants.AVATAR_TYPE_TOPBAR}
        />
        <Popover
          open={this.state.open}
          anchorEl={this.state.anchorEl}
          onRequestClose={this.handleClose.bind(this)}
        >
          <Menu multiple={false}>
            <MenuItemLink
              label="Profile"
              onClick={this.handleClose.bind(this)}
              to={
                this.props.exerciseId
                  ? `/private/exercise/${this.props.exerciseId}/profile`
                  : '/private/user/profile'
              }
            />
            {this.props.userAdmin ? (
              <MenuItemLink label="Admin" to="/private/admin/index" />
            ) : (
              ''
            )}
            <MenuItemButton
              label="Sign out"
              onClick={this.logoutClick.bind(this)}
            />
          </Menu>
        </Popover>
      </div>
    );
  }
}

UserPopover.propTypes = {
  exerciseId: PropTypes.string,
  userGravatar: PropTypes.string,
  userAdmin: PropTypes.bool,
  logout: PropTypes.func,
  fetchToken: PropTypes.func,
  children: PropTypes.node,
};

const select = (state) => {
  const userId = R.path(['logged', 'user'], state.app);
  return {
    userGravatar: R.path(
      [userId, 'user_gravatar'],
      state.referential.entities.users,
    ),
    userAdmin: R.path([userId, 'user_admin'], state.referential.entities.users),
  };
};

export default connect(select, { fetchToken, logout })(UserPopover);
