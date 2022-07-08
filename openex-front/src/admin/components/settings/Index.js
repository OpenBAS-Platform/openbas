import React from 'react';
import * as PropTypes from 'prop-types';
import { Route, Switch } from 'react-router-dom';
import Parameters from './Parameters';
import Users from './users/Users';
import Groups from './groups/Groups';
import Tags from './tags/Tags';
import { errorWrapper } from '../../../components/Error';

const Index = () => (
  <Switch>
    <Route exact path="/admin/settings" render={errorWrapper(Parameters)} />
    <Route exact path="/admin/settings/users" render={errorWrapper(Users)} />
    <Route exact path="/admin/settings/groups" render={errorWrapper(Groups)} />
    <Route exact path="/admin/settings/tags" render={errorWrapper(Tags)} />
  </Switch>
);

Index.propTypes = {
  classes: PropTypes.object,
};

export default Index;
