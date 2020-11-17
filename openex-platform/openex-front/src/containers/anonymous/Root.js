import React, { Component } from 'react';
import PropTypes from 'prop-types';
import DocumentTitle from '../../components/DocumentTitle';

class RootAnonymous extends Component {
  render() {
    return (
      <DocumentTitle title="OpenEx - Crisis management exercises platform">
        <div>{this.props.children}</div>
      </DocumentTitle>
    );
  }
}

RootAnonymous.propTypes = {
  children: PropTypes.node,
};

export default RootAnonymous;
