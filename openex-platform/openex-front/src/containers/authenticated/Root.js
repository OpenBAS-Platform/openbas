import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import * as R from 'ramda';
import { Route, Switch } from 'react-router';
import { connectedRouterRedirect } from 'redux-auth-wrapper/history4/redirect';
import Snackbar from '@material-ui/core/Snackbar';
import Alert from '@material-ui/lab/Alert';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import { withStyles } from '@material-ui/core/styles';
import { withRouter } from 'react-router-dom';
import { T } from '../../components/I18n';
import { i18nRegister } from '../../utils/Messages';
import { savedDismiss } from '../../actions/Application';
import IndexAuthenticated from './Index';
import IndexProfile from './profile/Index';
import RootAdmin from './admin/Root';
import RootExercise from './exercise/Root';
import UserPopover from './UserPopover';

const UserIsAdmin = connectedRouterRedirect({
  authenticatedSelector: (state) => state.app.logged.admin === true,
  redirectPath: '/private',
  allowRedirectBack: false,
  wrapperDisplayName: 'UserIsAdmin',
});

i18nRegister({
  fr: {
    'Action done.': 'Action effectuée.',
  },
});

const styles = (theme) => ({
  appBar: {
    width: '100%',
    zIndex: theme.zIndex.drawer + 1,
  },
  container: {
    padding: 20,
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
});

class RootAuthenticated extends Component {
  redirectToHome() {
    this.props.history.push('/private');
  }

  render() {
    const { classes } = this.props;
    return (
      <div>
        <Snackbar
          open={this.props.savedPopupOpen}
          autoHideDuration={4000}
          onClose={this.props.savedDismiss.bind(this)}
        >
          <Alert
            severity="info"
            onClose={this.props.savedDismiss.bind(this)}
            elevation={6}
            variant="outlined"
          >
            <T>Action done.</T>
          </Alert>
        </Snackbar>
        <AppBar position="fixed" className={classes.appBar}>
          <Toolbar>
            <img
              src="/images/logo_white.png"
              alt="logo"
              className={classes.logo}
              onClick={this.redirectToHome.bind(this)}
            />
            <div className={classes.title}>OpenEx</div>
            <UserPopover />
          </Toolbar>
        </AppBar>
        <div className={classes.toolbar} />
        <div className={classes.container}>
          <Switch>
            <Route path="/admin" component={UserIsAdmin(RootAdmin)} />
            <Route exact path="/private" component={IndexAuthenticated} />
            <Route exact path="/private/profile" component={IndexProfile} />
            <Route
              path="/private/exercise/:exerciseId"
              component={RootExercise}
            />
          </Switch>
        </div>
      </div>
    );
  }
}

RootAuthenticated.propTypes = {
  children: PropTypes.node,
  savedPopupOpen: PropTypes.bool,
  savedDismiss: PropTypes.func,
};

const select = (state) => ({
  savedPopupOpen: state.screen.saved || false,
});

export default R.compose(
  withRouter,
  connect(select, { savedDismiss }),
  withStyles(styles),
)(RootAuthenticated);
