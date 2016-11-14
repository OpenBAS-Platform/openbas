import React, {Component, PropTypes} from 'react'
import Chronology from './Chronos'

class Index extends Component {
  render() {
    return (
        <Chronology />
    );
  }
}

Index.propTypes = {
  params: PropTypes.object,
}

export default Index;
