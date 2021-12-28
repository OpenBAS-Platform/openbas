import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import * as R from 'ramda';
import { withStyles } from '@mui/styles';
import { connect } from 'react-redux';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { Link } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import { AccountCircleOutlined } from '@mui/icons-material';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { logout } from '../../../actions/Application';
import logo from '../../../resources/images/logo_openex_horizontal_small.png';
import inject18n from '../../../components/i18n';

const styles = (theme) => ({
  appBar: {
    width: '100%',
    zIndex: theme.zIndex.drawer + 1,
    background: 0,
    backgroundColor: theme.palette.background.header,
    borderTop: 0,
    paddingTop: theme.spacing(0.2),
  },
  logoContainer: {
    marginLeft: -10,
  },
  logo: {
    cursor: 'pointer',
    height: 35,
  },
  title: {
    fontSize: 25,
    marginLeft: 20,
  },
  barRight: {
    position: 'absolute',
    right: 5,
  },
  button: {
    float: 'left',
  },
});

class TopBar extends Component {
  constructor(props) {
    super(props);
    this.state = { open: false, anchorEl: null };
  }

  handleOpen(event) {
    this.setState({ open: true, anchorEl: event.currentTarget });
  }

  handleClose() {
    this.setState({ open: false, anchorEl: null });
  }

  handleLogout() {
    this.handleClose();
    this.props.logout();
  }

  render() {
    const { classes, t } = this.props;
    return (
      <AppBar position="fixed" className={classes.appBar} variant="outlined">
        <Toolbar>
          <div className={classes.logoContainer}>
            <Link to="/">
              <img src={logo} alt="logo" className={classes.logo} />
            </Link>
          </div>
          <div className={classes.barRight}>
            <IconButton
              onClick={this.handleOpen.bind(this)}
              size="large"
              classes={{ root: classes.button }}
            >
              <AccountCircleOutlined />
            </IconButton>
            <Menu
              anchorEl={this.state.anchorEl}
              open={this.state.open}
              onClose={this.handleClose.bind(this)}
            >
              <MenuItem
                onClick={this.handleClose.bind(this)}
                component={Link}
                to="/profile"
              >
                {t('Profile')}
              </MenuItem>
              <MenuItem onClick={this.handleLogout.bind(this)}>
                {t('Logout')}
              </MenuItem>
            </Menu>
          </div>
        </Toolbar>
      </AppBar>
    );
  }
}

TopBar.propTypes = {
  classes: PropTypes.object,
  userGravatar: PropTypes.string,
  logout: PropTypes.func,
};

const select = (state) => {
  const userId = R.path(['logged', 'user'], state.app);
  return {
    userGravatar: R.path(
      [userId, 'user_gravatar'],
      state.referential.entities.users,
    ),
  };
};

export default R.compose(
  connect(select, { logout }),
  inject18n,
  withStyles(styles),
)(TopBar);
