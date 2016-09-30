import React, {PropTypes, Component} from 'react';
import LocalMovies from 'material-ui/svg-icons/maps/local-movies'
import {zIndex} from 'material-ui/styles';
import {connect} from 'react-redux';

import {Drawer} from '../../../components/Drawer';
import {List} from '../../../components/List';
import {IconListItemLink} from '../../../components/list/ListItem';
import {AppBar} from '../../../components/AppBar';
import {toggleLeftBar} from '../../../actions/Application'

class NavBar extends Component {

  handleToggle() {
    this.props.toggleLeftBar()
  }
  
  render() {
    return (
      <Drawer
        width={65}
        docked={true}
        open={true}
        style={{zIndex: zIndex.drawer - 50}}
      >
        <AppBar onLeftIconButtonTouchTap={this.handleToggle.bind(this)}/>
        <List>
          <IconListItemLink to="/exercises" leftIcon={<LocalMovies style={{margin: 0, padding: 0, left: 19, top: 8}} />}/>
        </List>
      </Drawer>
    );
  }
}

NavBar.propTypes = {
  toggleLeftBar: PropTypes.func,
  open: PropTypes.bool
}

const select = (state) => {
  return {
    open: state.application.getIn(['ui', 'navbar_left_open'])
  }
}

export default connect(select, {toggleLeftBar})(NavBar)