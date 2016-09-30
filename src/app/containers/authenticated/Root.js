import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import {zIndex} from 'material-ui/styles';
import LocalMovies from 'material-ui/svg-icons/maps/local-movies'

import {toggleLeftBar} from '../../actions/Application'
import {AppBar} from '../../components/AppBar'
import {Drawer} from '../../components/Drawer'
import {List} from '../../components/List'
import {IconListItemLink} from "../../components/list/ListItem"
import UserPopover from './user/UserPopover'
import LeftBar from './nav/LeftBar'

const styles = {
  root: {
    padding: '20px 20px 0 85px',
  },
  title: {
    marginLeft: 20
  }
}

class RootAuthenticated extends Component {
  constructor(props) {
    super(props);

    this.state = {
      menu_right_open: false,
    }
  }

  toggleLeftBar() {
    this.props.toggleLeftBar()
  }

  render() {
    return (
      <div>
        <AppBar
          title="OpenEx"
          titleStyle={styles.title}
          onLeftIconButtonTouchTap={this.toggleLeftBar.bind(this)}
          iconElementRight={<UserPopover/>}/>
        <Drawer
          width={65}
          docked={true}
          open={true}
          style={{zIndex: zIndex.drawer - 50}}
        >
          <AppBar onLeftIconButtonTouchTap={this.toggleLeftBar.bind(this)}/>
          <List>
            <IconListItemLink to="/exercises" leftIcon={<LocalMovies style={{margin: 0, padding: 0, left: 19, top: 8}} />}/>
          </List>
        </Drawer>
        <LeftBar />
        <div style={styles.root}>
          {this.props.children}
        </div>
      </div>
    )
  }
}

RootAuthenticated.propTypes = {
  leftBarOpen: PropTypes.bool,
  userFirstname: PropTypes.string,
  userGravatar: PropTypes.string,
  toggleLeftBar: PropTypes.func,
  logout: PropTypes.func,
  children: React.PropTypes.node
}

export default connect(null, {toggleLeftBar})(RootAuthenticated)