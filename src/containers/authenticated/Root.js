import React, {Component} from 'react'
import {connect} from 'react-redux'
import {Snackbar} from '../../components/Snackbar'
import {CircularSpinner} from '../../components/Spinner'
import * as Constants from '../../constants/ComponentTypes'

class RootAuthenticated extends Component {
  render() {
    return (
      <div>
        {this.props.children}
        <Snackbar type={Constants.SNACKBAR_TYPE_LOADING} message={<CircularSpinner size={30} />} open={this.props.loading}/>
      </div>
    )
  }
}

RootAuthenticated.propTypes = {
  loading: React.PropTypes.bool,
  children: React.PropTypes.node
}

const select = (state) => {
  return {
    loading: state.screen.loading || false
  }
}

export default connect(select, null)(RootAuthenticated)