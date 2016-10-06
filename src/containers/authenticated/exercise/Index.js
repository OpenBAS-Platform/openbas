import React, {Component, PropTypes} from 'react'
import NavBar from './nav/NavBar'
import LeftBar from './nav/LeftBar'

class Index extends Component {
  render() {
    return (
      <div>
        <NavBar params={this.props.params}/>
        <LeftBar params={this.props.params}/>
        <h1>Title</h1>

      </div>
    );
  }
}

Index.propTypes = {
  params: PropTypes.object,
}

export default Index;