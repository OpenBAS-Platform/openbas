import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import * as Constants from '../../../../constants/ComponentTypes'
import {Popover} from '../../../../components/Popover';
import {Menu} from '../../../../components/Menu'
import {IconButton} from '../../../../components/Button'
import {Icon} from '../../../../components/Icon'
import {MenuItemLink, MenuItemButton} from "../../../../components/menu/MenuItem"

const style = {
  float: 'left',
  marginTop: '-14px'
}

class AudiencePopover extends Component {
  constructor(props) {
    super(props);
    this.state = {open: false}
  }

  handleOpen(event) {
    event.preventDefault()
    this.setState({
      open: true,
      anchorEl: event.currentTarget,
    })
  }

  handleClose() {
    this.setState({open: false})
  }

  handleEdit() {

  }

  handleDelete() {

  }

  render() {
    return (
      <div style={style}>
        <IconButton onClick={this.handleOpen.bind(this)}>
          <Icon name={Constants.ICON_NAME_NAVIGATION_MORE_VERT}/>
        </IconButton>
        <Popover open={this.state.open}
                 anchorEl={this.state.anchorEl}
                 onRequestClose={this.handleClose.bind(this)}>
          <Menu multiple={false}>
            <MenuItemLink label="Edit" onTouchTap={this.handleEdit.bind(this)}/>
            <MenuItemButton label="Delete" onTouchTap={this.handleDelete.bind(this)}/>
          </Menu>
        </Popover>
      </div>
    )
  }
}

AudiencePopover.propTypes = {
  userGravatar: PropTypes.string,
  logout: PropTypes.func,
  children: PropTypes.node
}

const select = (state) => {

  return {

  }
}

export default connect(select, null)(AudiencePopover)