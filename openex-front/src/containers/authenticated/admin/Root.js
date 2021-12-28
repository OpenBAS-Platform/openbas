import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as PropTypes from 'prop-types';
import { Route, Switch } from 'react-router';
import * as R from 'ramda';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import { Link, withRouter } from 'react-router-dom';
import { DescriptionOutlined } from '@mui/icons-material';
import withStyles from '@mui/styles/withStyles';
import { i18nRegister } from '../../../utils/Messages';
import { redirectToHome } from '../../../actions/Application';
import LeftBar from './nav/LeftBar';
import UserPopover from '../UserPopover';
import IndexAdmin from './Index';
import IndexAdminUsers from './user/Index';
import IndexAdminGroups from './group/Index';

i18nRegister({
  fr: {
    Administratinon: 'Administration',
  },
});

const styles = (theme) => ({
  appBar: {
    width: '100%',
    zIndex: theme.zIndex.drawer + 1,
  },
  container: {
    padding: '20px 20px 20px 200px',
  },
  logo: {
    width: '40px',
    cursor: 'pointer',
  },
  title: {
    fontSize: 25,
    marginLeft: 20,
  },
  toolbar: theme.mixins.toolbar,
  empty: {
    marginTop: 40,
    fontSize: '18px',
    fontWeight: 500,
    textAlign: 'center',
  },
  documents: {
    color: '#ffffff',
    position: 'absolute',
    top: 8,
    right: 70,
  },
});

class RootAuthenticated extends Component {
  toggleLeftBar() {
    this.props.toggleLeftBar();
  }

  redirectToHome() {
    this.props.redirectToHome();
  }

  render() {
    const { classes } = this.props;
    return (
      <div>
        <LeftBar pathname={this.props.pathname} />
        <AppBar position="fixed" className={classes.appBar}>
          <Toolbar>
            <img
              src="/images/logo_white.png"
              alt="logo"
              className={classes.logo}
              onClick={this.redirectToHome.bind(this)}
            />
            <div className={classes.title}>OpenEx</div>
            <IconButton
              component={Link}
              to="/private/documents"
              className={classes.documents}
              size="large">
              <DescriptionOutlined fontSize="default" />
            </IconButton>
            <UserPopover />
          </Toolbar>
        </AppBar>
        <div className={classes.toolbar} />
        <div className={classes.container}>
          <Switch>
            <Route exact path="/private/admin" component={IndexAdmin} />
            <Route
              exact
              path="/private/admin/users"
              component={IndexAdminUsers}
            />
            <Route
              exact
              path="/private/admin/groups"
              component={IndexAdminGroups}
            />
          </Switch>
        </div>
      </div>
    );
  }
}

RootAuthenticated.propTypes = {
  pathname: PropTypes.string,
  leftBarOpen: PropTypes.bool,
  toggleLeftBar: PropTypes.func,
  logout: PropTypes.func,
  redirectToHome: PropTypes.func,
  children: PropTypes.node,
  params: PropTypes.object,
};

const select = (state, ownProps) => {
  const { pathname } = ownProps.location;
  return {
    pathname,
  };
};

export default R.compose(
  withRouter,
  connect(select, { redirectToHome }),
  withStyles(styles),
)(RootAuthenticated);
