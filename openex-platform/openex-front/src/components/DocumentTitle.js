import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDocumentTitle from 'react-document-title';
import { injectIntl } from 'react-intl';

class DocumentTitle extends Component {
  render() {
    const title = this.props.intl.formatMessage({ id: this.props.title });
    return (
      <ReactDocumentTitle title={title}>
        <div>{this.props.children}</div>
      </ReactDocumentTitle>
    );
  }
}

DocumentTitle.propTypes = {
  title: PropTypes.string.isRequired,
  intl: PropTypes.object,
  children: PropTypes.node,
};

export default injectIntl(DocumentTitle);
