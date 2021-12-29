import React from 'react';
import * as PropTypes from 'prop-types';
import { Route, Switch } from 'react-router-dom';
import Parameters from './Parameters';
import Users from './Users';

const Index = () => (
  <Switch>
    <Route exact path="/settings" component={Parameters} />
    <Route exact path="/settings/users" component={Users} />
    <Route exact path="/settings/groups" component={Users} />
    <Route exact path="/settings/tags" component={Users} />
  </Switch>
);

Index.propTypes = {
  classes: PropTypes.object,
};

export default Index;
