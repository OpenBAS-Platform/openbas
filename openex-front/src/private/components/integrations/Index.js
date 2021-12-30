import React from 'react';
import * as PropTypes from 'prop-types';
import { Route, Switch } from 'react-router-dom';
import Integrations from './Integrations';

const Index = () => (
  <Switch>
    <Route exact path="/integrations" component={Integrations} />
  </Switch>
);

Index.propTypes = {
  classes: PropTypes.object,
};

export default Index;
