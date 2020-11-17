import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { List } from 'material-ui/List';
import * as Constants from '../../../../constants/ComponentTypes';
import { Drawer } from '../../../../components/Drawer';
import { ListItemLink } from '../../../../components/list/ListItem';
import { AppBar } from '../../../../components/AppBar';
import { Icon } from '../../../../components/Icon';
import {
  redirectToExercise,
  toggleLeftBar,
} from '../../../../actions/Application';
import { i18nRegister } from '../../../../utils/Messages';

i18nRegister({
  fr: {
    Home: 'Accueil',
    Execution: 'Exécution',
    Lessons: 'Expérience',
    Checks: 'Vérifications',
    Objectives: 'Objectifs',
    Scenario: 'Scénario',
    Audiences: 'Audiences',
    Statistics: 'Statistiques',
    Settings: 'Paramètres',
  },
});

class LeftBar extends Component {
  handleToggle() {
    this.props.toggleLeftBar();
  }

  redirectToHome() {
    this.props.redirectToExercise(this.props.id);
    this.handleToggle();
  }

  render() {
    return (
      <Drawer
        width={200}
        docked={false}
        open={this.props.open}
        zindex={40}
        onRequestChange={this.handleToggle.bind(this)}
      >
        <AppBar
          title="OpenEx"
          type={Constants.APPBAR_TYPE_LEFTBAR}
          onTitleTouchTap={this.redirectToHome.bind(this)}
          onLeftIconButtonTouchTap={this.handleToggle.bind(this)}
        />
        <List>
          <ListItemLink
            type={Constants.LIST_ITEM_NOSPACE}
            active={
              this.props.pathname === `/private/exercise/${this.props.id}`
              || this.props.pathname.includes(
                `/private/exercise/${this.props.id}/world`,
              )
            }
            onClick={this.handleToggle.bind(this)}
            to={`/private/exercise/${this.props.id}`}
            label="Home"
            leftIcon={<Icon name={Constants.ICON_NAME_SOCIAL_PUBLIC} />}
          />
          <ListItemLink
            type={Constants.LIST_ITEM_NOSPACE}
            active={this.props.pathname.includes(
              `/private/exercise/${this.props.id}/execution`,
            )}
            onClick={this.handleToggle.bind(this)}
            to={`/private/exercise/${this.props.id}/execution`}
            label="Execution"
            leftIcon={
              <Icon name={Constants.ICON_NAME_AV_PLAY_CIRCLE_OUTLINE} />
            }
          />
          <ListItemLink
            type={Constants.LIST_ITEM_NOSPACE}
            active={this.props.pathname.includes(
              `/private/exercise/${this.props.id}/lessons`,
            )}
            onClick={this.handleToggle.bind(this)}
            to={`/private/exercise/${this.props.id}/lessons`}
            label="Lessons"
            leftIcon={<Icon name={Constants.ICON_NAME_SOCIAL_SCHOOL} />}
          />
          <ListItemLink
            type={Constants.LIST_ITEM_NOSPACE}
            active={this.props.pathname.includes(
              `/private/exercise/${this.props.id}/checks`,
            )}
            onClick={this.handleToggle.bind(this)}
            to={`/private/exercise/${this.props.id}/checks`}
            label="Checks"
            leftIcon={<Icon name={Constants.ICON_NAME_DEVICE_GRAPHIC_EQ} />}
          />
          <ListItemLink
            type={Constants.LIST_ITEM_NOSPACE}
            active={
              this.props.pathname
              === `/private/exercise/${this.props.id}/objectives`
            }
            onClick={this.handleToggle.bind(this)}
            to={`/private/exercise/${this.props.id}/objectives`}
            label="Objectives"
            leftIcon={<Icon name={Constants.ICON_NAME_CONTENT_FLAG} />}
          />
          <ListItemLink
            type={Constants.LIST_ITEM_NOSPACE}
            active={this.props.pathname.includes(
              `/private/exercise/${this.props.id}/scenario`,
            )}
            onClick={this.handleToggle.bind(this)}
            to={`/private/exercise/${this.props.id}/scenario`}
            label="Scenario"
            leftIcon={<Icon name={Constants.ICON_NAME_LOCAL_MOVIES} />}
          />
          <ListItemLink
            type={Constants.LIST_ITEM_NOSPACE}
            active={
              this.props.pathname
              === `/private/exercise/${this.props.id}/audiences`
            }
            onClick={this.handleToggle.bind(this)}
            to={`/private/exercise/${this.props.id}/audiences`}
            label="Audiences"
            leftIcon={<Icon name={Constants.ICON_NAME_SOCIAL_GROUP} />}
          />
          <ListItemLink
            type={Constants.LIST_ITEM_NOSPACE}
            active={
              this.props.pathname
              === `/private/exercise/${this.props.id}/documents`
            }
            onClick={this.handleToggle.bind(this)}
            to={`/private/exercise/${this.props.id}/documents`}
            label="Documents"
            leftIcon={<Icon name={Constants.ICON_NAME_ACTION_DOCUMENTS} />}
          />
          <ListItemLink
            type={Constants.LIST_ITEM_NOSPACE}
            active={
              this.props.pathname
              === `/private/exercise/${this.props.id}/statistics`
            }
            onClick={this.handleToggle.bind(this)}
            to={`/private/exercise/${this.props.id}/statistics`}
            label="Statistics"
            leftIcon={<Icon name={Constants.ICON_NAME_EDITOR_INSERT_CHART} />}
          />
          <ListItemLink
            type={Constants.LIST_ITEM_NOSPACE}
            active={
              this.props.pathname
              === `/private/exercise/${this.props.id}/settings`
            }
            onClick={this.handleToggle.bind(this)}
            to={`/private/exercise/${this.props.id}/settings`}
            label="Settings"
            leftIcon={<Icon name={Constants.ICON_NAME_ACTION_SETTINGS} />}
          />
        </List>
      </Drawer>
    );
  }
}

LeftBar.propTypes = {
  id: PropTypes.string.isRequired,
  exercise_type: PropTypes.string,
  pathname: PropTypes.string.isRequired,
  toggleLeftBar: PropTypes.func,
  open: PropTypes.bool,
  redirectToExercise: PropTypes.func,
};

const select = (state) => ({
  open: state.screen.navbar_left_open,
});

export default connect(select, { redirectToExercise, toggleLeftBar })(LeftBar);
