import React, {Component} from 'react'
import {connect} from 'react-redux'
import {Link} from 'react-router'
import * as Constants from '../../../../constants/ComponentTypes'
import {Drawer} from '../../../../components/Drawer'
import {List} from '../../../../components/List'
import {CircularSpinner} from '../../../../components/Spinner'
import {IconListItemLink} from '../../../../components/list/ListItem'
import {Icon} from '../../../../components/Icon'
import {AppBar} from '../../../../components/AppBar'
import {toggleLeftBar} from '../../../../actions/Application'
import PropTypes from 'prop-types'

const styles = {
  exit: {
    position: 'absolute',
    bottom: '20px',
    left: '20px'
  }
}

class NavBar extends Component {
  handleToggle() {
    this.props.toggleLeftBar()
  }

  render() {
    return (
      <Drawer width={65} docked={true} open={true} zindex={50}>
        <AppBar onLeftIconButtonTouchTap={this.handleToggle.bind(this)} iconElementLeft={this.props.loading?<CircularSpinner size={30}/>:undefined} />
        <List>
          <IconListItemLink active={this.props.pathname === '/private/admin/index'}
                            to={'/private/admin/index'}
                            leftIcon={<Icon type={Constants.ICON_TYPE_NAVBAR}
                                            name={Constants.ICON_NAME_EDITOR_INSERT_CHART}/>}/>
          <IconListItemLink active={this.props.pathname.includes('/private/admin/users')}
                            to={'/private/admin/users'}
                            leftIcon={<Icon type={Constants.ICON_TYPE_NAVBAR}
                                            name={Constants.ICON_NAME_SOCIAL_PERSON}/>}/>
          <IconListItemLink active={this.props.pathname.includes('/private/admin/groups')}
                            to={'/private/admin/groups'}
                            leftIcon={<Icon type={Constants.ICON_TYPE_NAVBAR}
                                            name={Constants.ICON_NAME_SOCIAL_GROUP}/>}/>
        </List>
        <div style={styles.exit}>
          <Link to='/private' key='exit'>
            <Icon name={Constants.ICON_NAME_ACTION_EXIT_TO_APP}/>
          </Link>
        </div>
      </Drawer>
    )
  }
}

NavBar.propTypes = {
  pathname: PropTypes.string.isRequired,
  toggleLeftBar: PropTypes.func,
  open: PropTypes.bool,
  loading: PropTypes.bool
}

const select = (state) => {
  return {
    open: state.screen.navbar_left_open,
    loading: state.screen.loading || false
  }
}

export default connect(select, {toggleLeftBar})(NavBar)