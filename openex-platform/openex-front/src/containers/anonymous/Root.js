import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Route, Switch } from 'react-router';
import Login from './login/Login';
import IndexComcheck from './comcheck/Index';
import { UserIsNotAuthenticated } from '../../App';

class RootAnonymous extends Component {
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
        </Switch>
      </div>
    );
  }
}

RootAnonymous.propTypes = {
  children: PropTypes.node,
};

export default RootAnonymous;
