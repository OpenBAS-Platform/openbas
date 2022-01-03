import React from 'react';
import * as PropTypes from 'prop-types';
import { Switch } from 'react-router-dom';
import Parameters from './Parameters';
import Users from './users/Users';
import Groups from './groups/Groups';
import Tags from './tags/Tags';
import { BoundaryRoute } from '../../../components/Error';

const Index = () => (
  <Switch>
    <BoundaryRoute exact path="/settings" component={Parameters} />
    <BoundaryRoute exact path="/settings/users" component={Users} />
    <BoundaryRoute exact path="/settings/groups" component={Groups} />
    <BoundaryRoute exact path="/settings/tags" component={Tags} />
  </Switch>
);

Index.propTypes = {
  classes: PropTypes.object,
};

export default Index;
