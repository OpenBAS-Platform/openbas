import React, {Component} from 'react';

class RootAnonymous extends Component {
  render() {
    return (
      <div className="App">
        {this.props.children}
      </div>
    )
  }
}

RootAnonymous.propTypes = {
  children: React.PropTypes.node
}

export default RootAnonymous;