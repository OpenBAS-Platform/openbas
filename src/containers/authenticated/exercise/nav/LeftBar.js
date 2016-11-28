import React, {PropTypes, Component} from 'react'
import {connect} from 'react-redux'
import * as Constants from '../../../../constants/ComponentTypes'
import {Drawer} from '../../../../components/Drawer'
import {List} from 'material-ui/List';
import {ListItemLink} from '../../../../components/list/ListItem';
import {AppBar} from '../../../../components/AppBar'
import {Icon} from '../../../../components/Icon'
import {redirectToExercise, toggleLeftBar} from '../../../../actions/Application'
import {i18nRegister} from '../../../../utils/Messages'

i18nRegister({
  fr: {
    'Exercises': 'Exercices',
    'Users': 'Utilisateurs'
  }
})

class LeftBar extends Component {
  handleToggle() {
    this.props.toggleLeftBar()
  }

  redirectToHome() {
    this.props.redirectToExercise(this.props.id)
    this.handleToggle()
  }

  render() {
    return (
      <Drawer width={200} docked={false} open={this.props.open} zindex={100}
              onRequestChange={this.handleToggle.bind(this)}>
        <AppBar title="OpenEx" type={Constants.APPBAR_TYPE_LEFTBAR} onTitleTouchTap={this.redirectToHome.bind(this)}
                onLeftIconButtonTouchTap={this.handleToggle.bind(this)}/>
        <List>
          <ListItemLink type={Constants.LIST_ITEM_NOSPACE}
                        active={this.props.pathname === '/private/exercise/' + this.props.id}
                        onClick={this.handleToggle.bind(this)} to={'/private/exercise/' + this.props.id}
                        label="World"
                        leftIcon={<Icon name={Constants.ICON_NAME_SOCIAL_PUBLIC}/>}/>
          <ListItemLink type={Constants.LIST_ITEM_NOSPACE}
                        active={this.props.pathname === '/private/exercise/' + this.props.id + '/objectives'}
                        onClick={this.handleToggle.bind(this)} to={'/private/exercise/' + this.props.id + '/objectives'}
                        label="Objectives"
                        leftIcon={<Icon name={Constants.ICON_NAME_CONTENT_FLAG}/>}/>
          <ListItemLink type={Constants.LIST_ITEM_NOSPACE}
                        active={this.props.pathname.includes('/private/exercise/' + this.props.id + '/scenario')}
                        onClick={this.handleToggle.bind(this)} to={'/private/exercise/' + this.props.id + '/scenario'}
                        label="Scenario"
                        leftIcon={<Icon name={Constants.ICON_NAME_LOCAL_MOVIES}/>}/>
          <ListItemLink type={Constants.LIST_ITEM_NOSPACE}
                        active={this.props.pathname === '/private/exercise/' + this.props.id + '/audience'}
                        onClick={this.handleToggle.bind(this)} to={'/private/exercise/' + this.props.id + '/audience'}
                        label="Audience"
                        leftIcon={<Icon name={Constants.ICON_NAME_SOCIAL_GROUP}/>}/>
          <ListItemLink type={Constants.LIST_ITEM_NOSPACE}
                        active={this.props.pathname === '/private/exercise/' + this.props.id + '/settings'}
                        onClick={this.handleToggle.bind(this)} to={'/private/exercise/' + this.props.id + '/settings'}
                        label="Settings"
                        leftIcon={<Icon name={Constants.ICON_NAME_ACTION_SETTINGS}/>}/>
        </List>
      </Drawer>
    );
  }
}

LeftBar.propTypes = {
  id: PropTypes.string.isRequired,
  pathname: PropTypes.string.isRequired,
  toggleLeftBar: PropTypes.func,
  open: PropTypes.bool,
  redirectToExercise: PropTypes.func,
}

const select = (state) => {
  return {
    open: state.screen.navbar_left_open
  }
}

export default connect(select, {redirectToExercise, toggleLeftBar})(LeftBar)