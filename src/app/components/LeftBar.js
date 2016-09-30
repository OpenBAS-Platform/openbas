import React, {PropTypes, Component} from 'react';
import Drawer from 'material-ui/Drawer';
import {List, ListItem} from 'material-ui/List';
import {zIndex} from 'material-ui/styles';
import LocalMovies from 'material-ui/svg-icons/maps/local-movies'
import {connect} from 'react-redux';
import AppBar from 'material-ui/AppBar';
import {toggleLeftBar} from '../actions/Application'

class LeftBar extends Component {

  leftClick() {
    this.props.toggleLeftBar()
  }

  render() {
    return (
      <Drawer width={200} docked={true} open={this.props.open} style={{zIndex: zIndex.drawer - 100}}>
        <AppBar
          title="OpenEx"
          onLeftIconButtonTouchTap={this.leftClick.bind(this)}
        />
        <List>
          <ListItem primaryText="Exercises" leftIcon={<LocalMovies />}/>
        </List>
      </Drawer>
    );
  }
}

LeftBar.propTypes = {
  toggleLeftBar: PropTypes.func,
  open: PropTypes.bool
}

const select = (state) => {
  return {
    open: state.application.getIn(['ui', 'navbar_left_open'])
  }
}

export default connect(select, {toggleLeftBar})(LeftBar)