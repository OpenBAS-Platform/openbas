import React, {Component} from 'react'
import ReactDocumentTitle from 'react-document-title'
import {injectIntl} from 'react-intl'

class DocumentTitle extends Component {
  render() {
    const title = this.props.intl.formatMessage({id: this.props.title})
    return (
      <ReactDocumentTitle title={title}>
        <div>{this.props.children}</div>
      </ReactDocumentTitle>
    )
  }
}

DocumentTitle.propTypes = {
  title: React.PropTypes.string.isRequired,
  intl: React.PropTypes.object,
  children: React.PropTypes.node
}

export default injectIntl(DocumentTitle);