import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Route, Switch, withRouter } from 'react-router';
import * as R from 'ramda';
import { connect } from 'react-redux';
import Comcheck from './Comcheck';

class RootComcheck extends Component {
  render() {
    const { id, comcheckId } = this.props;
    return (
      <Switch>
        <Route
          exact
          path="/private/exercise/:exerciseId/checks/comcheck/:comcheckId"
          component={() => <Comcheck id={id} comcheckId={comcheckId} />}
        />
      </Switch>
    );
  }
}

RootComcheck.propTypes = {
  id: PropTypes.string,
  comcheckId: PropTypes.string,
  pathname: PropTypes.string,
  children: PropTypes.node,
  params: PropTypes.object,
};

const select = (state, ownProps) => {
  const { comcheckId } = ownProps.match.params;
  const { pathname } = ownProps.location;
  return {
    comcheckId,
    pathname,
  };
};

export default R.compose(withRouter, connect(select))(RootComcheck);
