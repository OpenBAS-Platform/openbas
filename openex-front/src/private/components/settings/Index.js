import React from 'react';
import * as PropTypes from 'prop-types';
import { Route, Switch } from 'react-router-dom';
import Parameters from './Parameters';
import Users from './users/Users';
import Groups from './groups/Groups';
import Tags from './tags/Tags';

const Index = () => (
  <Switch>
    <Route exact path="/settings" component={Parameters} />
    <Route exact path="/settings/users" component={Users} />
    <Route exact path="/settings/groups" component={Groups} />
    <Route exact path="/settings/tags" component={Tags} />
  </Switch>
);

Index.propTypes = {
  classes: PropTypes.object,
};

export default Index;
