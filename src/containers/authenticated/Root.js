import React, {Component} from 'react'

class RootAuthenticated extends Component {
  render() {
    return (
      <div>
        {this.props.children}
      </div>
    )
  }
}

RootAuthenticated.propTypes = {
  children: React.PropTypes.node
}

export default RootAuthenticated