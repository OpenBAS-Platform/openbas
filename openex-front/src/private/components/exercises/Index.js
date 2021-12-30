import React from 'react';
import * as PropTypes from 'prop-types';
import { Route, Switch } from 'react-router-dom';
import Exercises from './Exercises';

const Index = () => (
  <Switch>
    <Route exact path="/exercises" component={Exercises} />
  </Switch>
);

Index.propTypes = {
  classes: PropTypes.object,
};

export default Index;
