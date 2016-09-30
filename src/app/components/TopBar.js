import React, {PropTypes, Component} from 'react';
import AppBar from 'material-ui/AppBar';
import {connect} from 'react-redux';
import {toggleLeftBar} from '../actions/Application'

const styles = {
  title: {
    marginLeft: 20
  }
}

class TopBar extends Component {

  leftClick() {
    this.props.toggleLeftBar()
  }

  render() {
    return (
        <AppBar
        title="OpenEx"
        titleStyle={styles.title}
        onLeftIconButtonTouchTap={this.leftClick.bind(this)}
        />
    )
  }
}

TopBar.propTypes = {
  toggleLeftBar: PropTypes.func
}

export default connect(null, {toggleLeftBar})(TopBar)