import React from 'react';
import * as PropTypes from 'prop-types';
import { Route, Switch } from 'react-router-dom';
import Integrations from './Integrations';
import { errorWrapper } from '../../../components/Error';

const Index = () => (
  <Switch>
    <Route
      exact
      path="/admin/integrations"
      render={errorWrapper(Integrations)}
    />
  </Switch>
);

Index.propTypes = {
  classes: PropTypes.object,
};

export default Index;
