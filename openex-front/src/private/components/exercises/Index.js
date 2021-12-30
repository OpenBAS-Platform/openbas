import React from 'react';
import * as PropTypes from 'prop-types';
import { Route, Switch } from 'react-router-dom';
import Exercises from './Exercises';
import Exercise from './Exercise';

const Index = () => (
  <div>
    <Switch>
      <Route exact path="/exercises" component={Exercises} />
      <Route exact path="/exercises/:exerciseId" component={Exercise} />
    </Switch>
  </div>
);

Index.propTypes = {
  classes: PropTypes.object,
};

export default Index;
