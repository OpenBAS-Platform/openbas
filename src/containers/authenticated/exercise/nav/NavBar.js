import React, {PropTypes, Component} from 'react'
import {connect} from 'react-redux'
import * as Constants from '../../../../constants/ComponentTypes'
import {Drawer} from '../../../../components/Drawer'
import {List} from '../../../../components/List'
import {IconListItemLink} from '../../../../components/list/ListItem'
import {Icon} from '../../../../components/Icon'
import {AppBar} from '../../../../components/AppBar'
import {toggleLeftBar} from '../../../../actions/Application'

class NavBar extends Component {

  handleToggle() {
    this.props.toggleLeftBar()
  }

  render() {
    return (
      <Drawer width={65} docked={true} open={true} zindex={50}>
        <AppBar onLeftIconButtonTouchTap={this.handleToggle.bind(this)}/>
        <List>
          <IconListItemLink to="/exercise/world" leftIcon={<Icon type={Constants.ICON_TYPE_NAVBAR}
                                                            name={Constants.ICON_NAME_SOCIAL_PUBLIC}/>}/>
          <IconListItemLink to="/exercise/objectives" leftIcon={<Icon type={Constants.ICON_TYPE_NAVBAR}
                                                        name={Constants.ICON_NAME_CONTENT_FLAG}/>}/>
          <IconListItemLink to="/exercise/scenario" leftIcon={<Icon type={Constants.ICON_TYPE_NAVBAR}
                                                        name={Constants.ICON_NAME_CONTENT_FLAG}/>}/>
          <IconListItemLink to="/exercise/audience" leftIcon={<Icon type={Constants.ICON_TYPE_NAVBAR}
                                                        name={Constants.ICON_NAME_SOCIAL_GROUP}/>}/>
          <IconListItemLink to="/exercise/calendar" leftIcon={<Icon type={Constants.ICON_TYPE_NAVBAR}
                                                        name={Constants.ICON_NAME_ACTION_EVENT}/>}/>
        </List>
      </Drawer>
    )
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