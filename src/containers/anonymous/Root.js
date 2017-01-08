import React, {Component} from 'react'
import DocumentTitle from '../../components/DocumentTitle'

class RootAnonymous extends Component {
  render() {
    return (
      <DocumentTitle title='OpenEx - Crisis management exercises platform'>
        <div>{this.props.children}</div>
      </DocumentTitle>
    )
  }
}

RootAnonymous.propTypes = {
  children: React.PropTypes.node
}

export default RootAnonymous;