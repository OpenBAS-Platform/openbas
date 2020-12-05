import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Route, Switch } from 'react-router';
import NotFound from './NotFound';
// TODO @Sam fix dependency cycle
/* eslint-disable */
import Login from "./login/Login";
import IndexComcheck from "./comcheck/Index";
import { UserIsNotAuthenticated } from "../../App";
/* eslint-enable */

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
