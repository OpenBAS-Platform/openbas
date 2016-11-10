import React, {Component, PropTypes} from 'react'
import Chronology from './Chronology'

class Index extends Component {
  render() {
    return (
      <div style={{'background': 'lightgrey', 'height': 300}}>
        <Chronology />
      </div>
    );
  }
}

Index.propTypes = {
  params: PropTypes.object,
}

export default Index;
