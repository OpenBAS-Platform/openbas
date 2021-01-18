import React, { Component } from 'react';
import * as PropTypes from 'prop-types';
import { Route, Switch, withRouter } from 'react-router';
import * as R from 'ramda';
import { connect } from 'react-redux';
import Dryrun from './Dryrun';

class RootDryrun extends Component {
  render() {
    const { id, dryrunId } = this.props;
    return (
      <Switch>
        <Route
          exact
          path="/private/exercise/:exerciseId/checks/dryrun/:drydunId"
          component={() => <Dryrun id={id} dryrunId={dryrunId} />}
        />
      </Switch>
    );
  }
}

RootDryrun.propTypes = {
  id: PropTypes.string,
  dryrunId: PropTypes.string,
  pathname: PropTypes.string,
  children: PropTypes.node,
  params: PropTypes.object,
};

const select = (state, ownProps) => {
  const { dryrunId } = ownProps.match.params;
  const { pathname } = ownProps.location;
  return {
    dryrunId,
    pathname,
  };
};

export default R.compose(withRouter, connect(select))(RootDryrun);
