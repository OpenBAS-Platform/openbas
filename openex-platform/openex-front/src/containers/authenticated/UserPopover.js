import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import * as R from 'ramda';
import IconButton from '@material-ui/core/IconButton';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { Link } from 'react-router-dom';
import { withStyles } from '@material-ui/core/styles';
import { AccountCircleOutlined } from '@material-ui/icons';
import { logout, fetchToken } from '../../actions/Application';
import { i18nRegister } from '../../utils/Messages';
import { T } from '../../components/I18n';

i18nRegister({
  fr: {
    'Sign out': 'Se déconnecter',
    Profile: 'Profil',
    Admin: 'Admin',
  },
});

const styles = () => ({
  topAvatar: {
    position: 'absolute',
    top: 8,
    right: 15,
    color: '#ffffff',
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
    const { classes } = this.props;
    return (
      <div>
        <IconButton
          onClick={this.handleOpen.bind(this)}
          className={classes.topAvatar}
        >
          <AccountCircleOutlined />
        </IconButton>
        <Menu
          style={{ marginTop: 40, zIndex: 2100 }}
          anchorEl={this.state.anchorEl}
          open={this.state.open}
          onClose={this.handleClose.bind(this)}
        >
          <MenuItem
            onClick={this.handleClose.bind(this)}
            component={Link}
            to={
              this.props.exerciseId
                ? `/private/exercise/${this.props.exerciseId}/profile`
                : '/private/profile'
            }
          >
            <T>Profile</T>
          </MenuItem>
          {this.props.userAdmin && (
            <MenuItem component={Link} to="/private/admin/index">
              <T>Admin</T>
            </MenuItem>
          )}
          <MenuItem onClick={this.logoutClick.bind(this)}>
            <T>Sign out</T>
          </MenuItem>
        </Menu>
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

export default R.compose(
  connect(select, { fetchToken, logout }),
  withStyles(styles),
)(UserPopover);
