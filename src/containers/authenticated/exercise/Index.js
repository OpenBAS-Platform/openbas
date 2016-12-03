import React, {Component, PropTypes} from 'react'
import Chronology from './world/Chronos'

class Index extends Component {
  render() {
    return (
      <div>
        <Chronology />

      </div>
    )
  }
}

Index.propTypes = {
  params: PropTypes.object,
}

export default Index;
