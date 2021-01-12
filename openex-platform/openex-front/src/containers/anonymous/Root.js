import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Route, Switch } from 'react-router';
import { connectedRouterRedirect } from 'redux-auth-wrapper/history4/redirect';
import NotFound from './NotFound';
import Login from './login/Login';
import IndexComcheck from './comcheck/Index';

const UserIsNotAuthenticated = connectedRouterRedirect({
  redirectPath: '/private',
  authenticatedSelector: (state) => state.app.logged === null || state.app.logged === undefined,
  wrapperDisplayName: 'UserIsNotAuthenticated',
  allowRedirectBack: false,
});

class RootAnonymous extends Component {
  // eslint-disable-next-line class-methods-use-this
  render() {
    return (
      <div>
        <Switch>
          <Route
            exact
            path="/login"
            component={UserIsNotAuthenticated(Login)}
          />
          <Route exact path="/comcheck/:statusId" component={IndexComcheck} />
          <Route component={NotFound} />
        </Switch>
      </div>
    );
  }
}

RootAnonymous.propTypes = {
  children: PropTypes.node,
};

export default RootAnonymous;
