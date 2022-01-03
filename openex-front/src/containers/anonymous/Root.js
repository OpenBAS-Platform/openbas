import React, { Component } from 'react';
import * as PropTypes from 'prop-types';

class RootAnonymous extends Component {
  // eslint-disable-next-line class-methods-use-this
  render() {
    return <div>test</div>;
  }
}

RootAnonymous.propTypes = {
  children: PropTypes.node,
};

export default RootAnonymous;
