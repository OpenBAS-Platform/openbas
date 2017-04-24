import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import * as Constants from '../../../../constants/ComponentTypes'
import {Drawer} from '../../../../components/Drawer'
import {List} from 'material-ui/List';
import {ListItemLink} from '../../../../components/list/ListItem'
import {AppBar} from '../../../../components/AppBar'
import {Icon} from '../../../../components/Icon'
import {redirectToAdmin, toggleLeftBar} from '../../../../actions/Application'
import {i18nRegister} from '../../../../utils/Messages'

i18nRegister({
  fr: {
    'Home': 'Accueil',
    'Users': 'Utilisateurs',
    'Groups': 'Groupes'
  }
})

class LeftBar extends Component {
  handleToggle() {
    this.props.toggleLeftBar()
  }

  redirectToAdmin() {
    this.props.redirectToAdmin()
    this.handleToggle()
  }

  render() {
    return (
      <Drawer width={200} docked={false} open={this.props.open} zindex={100}
              onRequestChange={this.handleToggle.bind(this)}>
        <AppBar title="OpenEx" type={Constants.APPBAR_TYPE_LEFTBAR} onTitleTouchTap={this.redirectToAdmin.bind(this)}
                onLeftIconButtonTouchTap={this.handleToggle.bind(this)}/>
        <List>
          <ListItemLink type={Constants.LIST_ITEM_NOSPACE}
                        active={this.props.pathname === '/private/admin/index'}
                        onClick={this.handleToggle.bind(this)} to={'/private/admin/index'}
                        label="Home"
                        leftIcon={<Icon name={Constants.ICON_NAME_EDITOR_INSERT_CHART}/>}/>
          <ListItemLink type={Constants.LIST_ITEM_NOSPACE}
                        active={this.props.pathname.includes('/private/admin/users')}
                        onClick={this.handleToggle.bind(this)} to={'/private/admin/users'}
                        label="Users"
                        leftIcon={<Icon name={Constants.ICON_NAME_SOCIAL_PERSON}/>}/>
          <ListItemLink type={Constants.LIST_ITEM_NOSPACE}
                        active={this.props.pathname === '/private/admin/groups'}
                        onClick={this.handleToggle.bind(this)} to={'/private/admin/groups'}
                        label="Groups"
                        leftIcon={<Icon name={Constants.ICON_NAME_SOCIAL_GROUP}/>}/>
        </List>
      </Drawer>
    );
  }
}

LeftBar.propTypes = {
  pathname: PropTypes.string.isRequired,
  toggleLeftBar: PropTypes.func,
  open: PropTypes.bool,
  redirectToAdmin: PropTypes.func,
}

const select = (state) => {
  return {
    open: state.screen.navbar_left_open
  }
}

export default connect(select, {redirectToAdmin, toggleLeftBar})(LeftBar)