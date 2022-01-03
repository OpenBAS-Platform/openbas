import React from 'react';
import * as PropTypes from 'prop-types';
import { Switch } from 'react-router-dom';
import Integrations from './Integrations';
import { BoundaryRoute } from '../../../components/Error';

const Index = () => (
  <Switch>
    <BoundaryRoute exact path="/integrations" component={Integrations} />
  </Switch>
);

Index.propTypes = {
  classes: PropTypes.object,
};

export default Index;
