import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Route, Switch, withRouter } from 'react-router';
import * as R from 'ramda';
import { connect } from 'react-redux';
import IndexExerciseAudiencesAudience from './Index';

class RootAudience extends Component {
  render() {
    const { id, audienceId } = this.props;
    return (
      <Switch>
        <Route
          exact
          path="/private/exercise/:exerciseId/audiences/:audienceId"
          component={() => (
            <IndexExerciseAudiencesAudience id={id} audienceId={audienceId} />
          )}
        />
      </Switch>
    );
  }
}

RootAudience.propTypes = {
  id: PropTypes.string,
  audienceId: PropTypes.string,
  pathname: PropTypes.string,
  children: PropTypes.node,
  params: PropTypes.object,
};

const select = (state, ownProps) => {
  const { audienceId } = ownProps.match.params;
  const { pathname } = ownProps.location;
  return {
    audienceId,
    pathname,
  };
};

export default R.compose(withRouter, connect(select))(RootAudience);
