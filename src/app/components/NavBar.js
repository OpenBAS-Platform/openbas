import React, {PropTypes, Component} from 'react';
import Drawer from 'material-ui/Drawer';
import {List, ListItem} from 'material-ui/List';
import {zIndex} from 'material-ui/styles';
import LocalMovies from 'material-ui/svg-icons/maps/local-movies'
import AppBar from 'material-ui/AppBar';
import {connect} from 'react-redux';
import {toggleLeftBar} from '../actions/Application'

class NavBar extends Component {

  leftClick() {
    this.props.toggleLeftBar()
  }

  render() {
    return (
      <Drawer width={65} docked={true} open={true} style={{zIndex: zIndex.drawer - 50}}>
        <AppBar
          onLeftIconButtonTouchTap={this.leftClick.bind(this)}
        />
        <List>
          <ListItem leftIcon={<LocalMovies />}/>
        </List>
      </Drawer>
    );
  }
}

NavBar.propTypes = {
  toggleLeftBar: PropTypes.func
}

export default connect(null, {toggleLeftBar})(NavBar)