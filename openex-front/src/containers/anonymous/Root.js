import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Route, Switch } from 'react-router';
import NotFound from './NotFound';
import IndexComcheck from './comcheck/Index';

class RootAnonymous extends Component {
  // eslint-disable-next-line class-methods-use-this
  render() {
    return (
      <div>
        <Switch>
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
