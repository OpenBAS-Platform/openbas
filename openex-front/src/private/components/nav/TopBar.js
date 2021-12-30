import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import * as R from 'ramda';
import { withStyles } from '@mui/styles';
import { connect } from 'react-redux';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { Link, withRouter } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import { AccountCircleOutlined } from '@mui/icons-material';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { logout } from '../../../actions/Application';
import logo from '../../../resources/images/logo_openex_horizontal_small.png';
import inject18n from '../../../components/i18n';
import TopMenuDashboard from './TopMenuDashboard';
import TopMenuSettings from './TopMenuSettings';
import TopMenuExercises from './TopMenuExercises';
import TopMenuExercise from './TopMenuExercise';
import TopMenuPlayers from './TopMenuPlayers';
import TopMenuOrganizations from './TopMenuOrganizations';
import TopMenuDocuments from './TopMenuDocuments';
import TopMenuIntegrations from './TopMenuIntegrations';

const styles = (theme) => ({
  appBar: {
    width: '100%',
    zIndex: theme.zIndex.drawer + 1,
    background: 0,
    backgroundColor: theme.palette.background.header,
    paddingTop: theme.spacing(0.2),
  },
  flex: {
    flexGrow: 1,
  },
  logoContainer: {
    marginLeft: -10,
  },
  logo: {
    cursor: 'pointer',
    height: 35,
  },
  menuContainer: {
    float: 'left',
    marginLeft: 40,
  },
  barRight: {
    position: 'absolute',
    top: 15,
    right: 15,
    verticalAlign: 'middle',
    height: '100%',
  },
  barContainer: {
    display: 'table-cell',
    float: 'left',
    paddingTop: 10,
  },
  divider: {
    display: 'table-cell',
    float: 'left',
    height: '100%',
    margin: '0 5px 0 5px',
  },
  searchContainer: {
    display: 'table-cell',
    float: 'left',
    marginRight: 5,
    paddingTop: 9,
  },
  button: {
    display: 'table-cell',
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
    const { classes, t, location } = this.props;
    return (
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          <div className={classes.logoContainer}>
            <Link to="/">
              <img src={logo} alt="logo" className={classes.logo} />
            </Link>
          </div>
          <div className={classes.menuContainer}>
            {(location.pathname === '/'
              || location.pathname.includes('/import')) && <TopMenuDashboard />}
            {location.pathname === '/exercises' && <TopMenuExercises />}
            {location.pathname.includes('/exercises/') && <TopMenuExercise />}
            {location.pathname.includes('/players') && <TopMenuPlayers />}
            {location.pathname.includes('/organizations') && (
              <TopMenuOrganizations />
            )}
            {location.pathname.includes('/documents') && <TopMenuDocuments />}
            {location.pathname.includes('/integrations') && (
              <TopMenuIntegrations />
            )}
            {location.pathname.includes('/settings') && <TopMenuSettings />}
          </div>
          <div className={classes.barRight}>
            <IconButton onClick={this.handleOpen.bind(this)} size="small">
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
  location: PropTypes.object,
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
  withRouter,
  withStyles(styles),
)(TopBar);
