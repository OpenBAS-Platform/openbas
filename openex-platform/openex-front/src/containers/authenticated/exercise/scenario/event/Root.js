import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Route, Switch, withRouter } from 'react-router';
import * as R from 'ramda';
import { connect } from 'react-redux';
import IndexExerciseEventsEvent from './Index';

class RootEvent extends Component {
  render() {
    const { id, eventId } = this.props;
    return (
      <Switch>
        <Route
          exact
          path="/private/exercise/:exerciseId/scenario/:eventId"
          component={() => (
            <IndexExerciseEventsEvent id={id} eventId={eventId} />
          )}
        />
      </Switch>
    );
  }
}

RootEvent.propTypes = {
  id: PropTypes.string,
  eventId: PropTypes.string,
  pathname: PropTypes.string,
  children: PropTypes.node,
  params: PropTypes.object,
};

const select = (state, ownProps) => {
  const { eventId } = ownProps.match.params;
  const { pathname } = ownProps.location;
  return {
    eventId,
    pathname,
  };
};

export default R.compose(withRouter, connect(select))(RootEvent);
