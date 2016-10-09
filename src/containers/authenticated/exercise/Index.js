import React, {Component, PropTypes} from 'react'

class Index extends Component {
  render() {
    return (
      <div>
        <h1>Title</h1>

      </div>
    );
  }
}

Index.propTypes = {
  params: PropTypes.object,
}

export default Index;
