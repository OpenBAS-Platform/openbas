import React, {PropTypes, Component} from 'react';
import AppBar from 'material-ui/AppBar';
import Drawer from 'material-ui/Drawer';
import {List, ListItem} from 'material-ui/List';
import FontIcon from 'material-ui/FontIcon';
import {red500, yellow500, blue500} from 'material-ui/styles/colors';

const style = {
  menu: {
    width: 200
  },
  overlay: {
    backgroundColor: "#ffffff",
    opacity: 0
  }
};

class TopBar extends Component {

  constructor(props) {
    super(props);
    this.state = {open: false};
  }

  handleToggle() {
    this.setState({open: !this.state.open})
  }

  handleClose() {
    this.setState({open: false})
  }

  render() {
    return (
      <div>
        <AppBar/>
        <Drawer docked={false} width={style.menu.width} open={true} overlayStyle={style.overlay}>
          <AppBar iconElementLeft={<img src="images/logo.png"/>}/>
          <List>
            <ListItem primaryText="Home" leftIcon={<FontIcon className="material-icons">home</FontIcon>}/>
          </List>
        </Drawer>
      </div>
    );
  }
}

TopBar.propTypes = {
  title: PropTypes.string.isRequired,
  left: PropTypes.object,
  right: PropTypes.object
}


export default TopBar;