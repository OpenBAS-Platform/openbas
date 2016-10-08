import React, {PropTypes, Component} from 'react';
import {connect} from 'react-redux';
import * as Constants from '../../../../constants/ComponentTypes'
import {Drawer} from '../../../../components/Drawer';
import {List} from '../../../../components/List';
import {ListItemLink} from '../../../../components/list/ListItem';
import {AppBar} from '../../../../components/AppBar';
import {Icon} from '../../../../components/Icon'
import {redirectToHome, toggleLeftBar} from '../../../../actions/Application'
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
    this.props.redirectToHome()
    this.handleToggle()
  }

  render() {
    return (
      <Drawer width={200} docked={false} open={this.props.open} zindex={100}
              onRequestChange={this.handleToggle.bind(this)}>
        <AppBar title="OpenEx" type={Constants.APPBAR_TYPE_LEFTBAR} onTitleTouchTap={this.redirectToHome.bind(this)}
                onLeftIconButtonTouchTap={this.handleToggle.bind(this)}/>
        <List>
          <ListItemLink onClick={this.handleToggle.bind(this)} to={'/private/exercise/' + this.props.params.exerciseId + '/world'} label="World"
                        leftIcon={<Icon name={Constants.ICON_NAME_SOCIAL_PUBLIC}/>}/>
          <ListItemLink onClick={this.handleToggle.bind(this)} to={'/private/exercise/' + this.props.params.exerciseId + '/objectives'} label="Objectives"
                        leftIcon={<Icon name={Constants.ICON_NAME_CONTENT_FLAG}/>}/>
          <ListItemLink onClick={this.handleToggle.bind(this)} to={'/private/exercise/' + this.props.params.exerciseId + '/scenario'} label="Scenario"
                        leftIcon={<Icon name={Constants.ICON_NAME_LOCAL_MOVIES}/>}/>
          <ListItemLink onClick={this.handleToggle.bind(this)} to={'/private/exercise/' + this.props.params.exerciseId + '/audience'} label="Audience"
                        leftIcon={<Icon name={Constants.ICON_NAME_SOCIAL_GROUP}/>}/>
          <ListItemLink onClick={this.handleToggle.bind(this)} to={'/private/exercise/' + this.props.params.exerciseId + '/calendar'} label="Calendar"
                        leftIcon={<Icon name={Constants.ICON_NAME_ACTION_EVENT}/>}/>
          <ListItemLink onClick={this.handleToggle.bind(this)} to={'/private/exercise/' + this.props.params.exerciseId + '/settings'} label="Settings"
                        leftIcon={<Icon name={Constants.ICON_NAME_ACTION_SETTINGS}/>}/>
        </List>
      </Drawer>
    );
  }
}

LeftBar.propTypes = {
  toggleLeftBar: PropTypes.func,
  open: PropTypes.bool,
  redirectToHome: PropTypes.func,
  params: PropTypes.object.isRequired
}

const select = (state) => {
  return {
    open: state.application.getIn(['ui', 'navbar_left_open'])
  }
}

export default connect(select, {redirectToHome, toggleLeftBar})(LeftBar)